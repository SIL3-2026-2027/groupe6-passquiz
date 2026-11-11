<?php

namespace App\Services;

use App\Enums\QuestionType;
use App\Models\Answer;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuizService
{
    /**
     * Délai de tolérance (en secondes) accordé après la fin du temps imparti.
     */
    private const SUBMISSION_GRACE_SECONDS = 60;

    public function __construct(
        private CertificateService $certificates,
        private ProgressService $progress,
    ) {}

    /**
     * Démarre une tentative, ou reprend la tentative en cours si elle n'a pas expiré.
     *
     * @throws ValidationException
     */
    public function start(User $user, Quiz $quiz): QuizAttempt
    {
        if ($quiz->questions()->doesntExist()) {
            throw ValidationException::withMessages(['quiz' => 'Cette évaluation ne contient encore aucune question.']);
        }

        $attempts = $quiz->attempts()->whereBelongsTo($user)->get();

        $inProgress = $attempts->first(fn (QuizAttempt $attempt) => ! $attempt->isSubmitted());

        if ($inProgress !== null) {
            if (! $this->isExpired($inProgress)) {
                return $inProgress;
            }

            $this->submit($inProgress, []);
            $attempts = $quiz->attempts()->whereBelongsTo($user)->get();
        }

        $blockingReason = $this->blockingReason($user, $quiz, $attempts);

        if ($blockingReason !== null) {
            throw ValidationException::withMessages(['quiz' => $blockingReason]);
        }

        return $quiz->attempts()->create([
            'user_id' => $user->id,
            'attempt_number' => $attempts->count() + 1,
            'passing_score' => $quiz->passing_score,
            'question_order' => $this->drawQuestionOrder($quiz),
            'started_at' => now(),
        ]);
    }

    /**
     * Raison pour laquelle l'apprenant ne peut pas démarrer une nouvelle tentative, ou null s'il le peut.
     *
     * Règles appliquées dans l'ordre : inscription, cours terminés (ceux du module pour un quiz de module,
     * toute la formation pour l'évaluation finale), modules validés (évaluation finale, EF-11),
     * évaluation déjà réussie, nombre maximal de tentatives, délai avant de recommencer.
     *
     * @param  Collection<int, QuizAttempt>  $attempts  Tentatives de l'apprenant pour cette évaluation.
     */
    public function blockingReason(User $user, Quiz $quiz, Collection $attempts): ?string
    {
        if (! $user->isEnrolledIn($quiz->formation)) {
            return 'Vous devez être inscrit à la formation pour passer cette évaluation.';
        }

        if ($quiz->isFinal()) {
            if ($quiz->requires_course_completion && $this->progress->summary($user, $quiz->formation)['percent'] < 100) {
                return 'Terminez tous les cours de la formation avant de passer l\'évaluation finale.';
            }

            $modulesToValidate = $this->progress->modulesToValidate($user, $quiz->formation);

            if ($modulesToValidate->isNotEmpty()) {
                return 'Réussissez d\'abord le quiz de chaque module avant l\'évaluation finale (reste : '
                    .$modulesToValidate->map(fn (Module $module): string => "module {$module->number}")->join(', ').').';
            }
        } elseif ($quiz->requires_course_completion && ! $this->progress->hasCompletedModule($user, $quiz->module)) {
            return 'Terminez tous les cours du module avant de passer son quiz.';
        }

        if ($attempts->contains('passed', true)) {
            return 'Vous avez déjà réussi cette évaluation.';
        }

        if ($quiz->max_attempts !== null && $attempts->count() >= $quiz->max_attempts) {
            return 'Vous avez atteint le nombre maximal de tentatives.';
        }

        $nextAttemptAt = $this->nextAttemptAt($quiz, $attempts);

        if ($nextAttemptAt !== null) {
            return 'Vous pourrez recommencer l\'évaluation à partir du '.$nextAttemptAt->locale('fr')->translatedFormat('j F Y à H\hi').'.';
        }

        return null;
    }

    /**
     * Date à partir de laquelle une nouvelle tentative est autorisée, ou null si elle l'est déjà.
     *
     * @param  Collection<int, QuizAttempt>  $attempts
     */
    public function nextAttemptAt(Quiz $quiz, Collection $attempts): ?Carbon
    {
        if (! $quiz->retry_delay_minutes) {
            return null;
        }

        $lastSubmittedAt = $attempts->max('submitted_at');

        if ($lastSubmittedAt === null) {
            return null;
        }

        $nextAttemptAt = $lastSubmittedAt->copy()->addMinutes($quiz->retry_delay_minutes);

        return $nextAttemptAt->isFuture() ? $nextAttemptAt : null;
    }

    /**
     * Questions de la tentative (avec leurs réponses), dans l'ordre tiré au démarrage.
     *
     * @return EloquentCollection<int, Question>
     */
    public function questionsFor(QuizAttempt $attempt): EloquentCollection
    {
        $questions = $attempt->quiz->questions()->with('answers')->get();
        $order = collect($attempt->question_order ?? []);

        if ($order->isEmpty()) {
            return $questions;
        }

        $questionRank = $order->pluck('question_id')->flip();

        foreach ($questions as $question) {
            $answerRank = collect($order->firstWhere('question_id', $question->id)['answer_ids'] ?? [])->flip();

            $question->setRelation('answers', $question->answers
                ->sortBy(fn (Answer $answer): int => $answerRank[$answer->id] ?? PHP_INT_MAX)
                ->values());
        }

        return $questions
            ->sortBy(fn (Question $question): int => $questionRank[$question->id] ?? PHP_INT_MAX)
            ->values();
    }

    /**
     * Corrige automatiquement la tentative et calcule le score sur 100.
     *
     * @param  array<int|string, array<int, int|string>>  $responses  Réponses choisies, indexées par identifiant de question.
     *
     * @throws ValidationException
     */
    public function submit(QuizAttempt $attempt, array $responses): QuizAttempt
    {
        if ($attempt->isSubmitted()) {
            throw ValidationException::withMessages(['attempt' => 'Cette tentative a déjà été soumise.']);
        }

        if ($this->isExpired($attempt)) {
            $responses = [];
        }

        DB::transaction(function () use ($attempt, $responses): void {
            $questions = $attempt->quiz->questions()->with('answers')->get();

            $totalPoints = 0;
            $earnedPoints = 0;

            foreach ($questions as $question) {
                $selectedIds = $this->normalizeSelection($question, $responses[$question->id] ?? []);
                $isCorrect = $this->isCorrect($question, $selectedIds);
                $pointsEarned = $isCorrect ? $question->points : 0;

                $attempt->answers()->create([
                    'question_id' => $question->id,
                    'selected_answer_ids' => $selectedIds->all(),
                    'is_correct' => $isCorrect,
                    'points_earned' => $pointsEarned,
                ]);

                $totalPoints += $question->points;
                $earnedPoints += $pointsEarned;
            }

            $score = $totalPoints > 0 ? (int) round($earnedPoints / $totalPoints * 100) : 0;

            $attempt->update([
                'score' => $score,
                'earned_points' => $earnedPoints,
                'total_points' => $totalPoints,
                'passed' => $score >= $attempt->passing_score,
                'submitted_at' => now(),
            ]);

            if ($attempt->passed && $attempt->quiz->isFinal() && $this->progress->modulesToValidate($attempt->user, $attempt->quiz->formation)->isEmpty()) {
                $this->certificates->issueForAttempt($attempt);
            }
        });

        return $attempt->refresh();
    }

    /**
     * Date limite de soumission, ou null si l'évaluation n'est pas chronométrée.
     */
    public function deadline(QuizAttempt $attempt): ?Carbon
    {
        $timeLimit = $attempt->quiz->time_limit_minutes;

        return $timeLimit ? $attempt->started_at->copy()->addMinutes($timeLimit) : null;
    }

    public function isExpired(QuizAttempt $attempt): bool
    {
        $deadline = $this->deadline($attempt);

        return $deadline !== null && now()->greaterThan($deadline->copy()->addSeconds(self::SUBMISSION_GRACE_SECONDS));
    }

    /**
     * Tire l'ordre des questions et des réponses selon les options de mélange de l'évaluation.
     *
     * @return array<int, array{question_id: int, answer_ids: array<int, int>}>
     */
    private function drawQuestionOrder(Quiz $quiz): array
    {
        $questions = $quiz->questions()->with('answers')->get();

        if ($quiz->shuffle_questions) {
            $questions = $questions->shuffle();
        }

        return $questions->map(fn (Question $question): array => [
            'question_id' => $question->id,
            'answer_ids' => ($quiz->shuffle_answers && $question->type !== QuestionType::TrueFalse
                ? $question->answers->shuffle()
                : $question->answers
            )->modelKeys(),
        ])->values()->all();
    }

    /**
     * Ne conserve que les réponses appartenant à la question, triées et sans doublons.
     *
     * @param  array<int, int|string>|int|string  $selection
     * @return Collection<int, int>
     */
    private function normalizeSelection(Question $question, array|int|string $selection): Collection
    {
        return collect((array) $selection)
            ->map(fn (int|string $id): int => (int) $id)
            ->intersect($question->answers->modelKeys())
            ->unique()
            ->sort()
            ->values();
    }

    /**
     * Une question est juste uniquement si l'ensemble des réponses choisies correspond exactement aux bonnes réponses.
     *
     * @param  Collection<int, int>  $selectedIds
     */
    private function isCorrect(Question $question, Collection $selectedIds): bool
    {
        $correctIds = $question->answers->where('is_correct', true)->modelKeys();
        sort($correctIds);

        return $correctIds !== [] && $selectedIds->all() === $correctIds;
    }
}
