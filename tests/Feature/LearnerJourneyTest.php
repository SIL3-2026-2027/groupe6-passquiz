<?php

namespace Tests\Feature;

use App\Models\Answer;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Formation;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LearnerJourneyTest extends TestCase
{
    use RefreshDatabase;

    private User $learner;

    private Formation $formation;

    private Quiz $quiz;

    /**
     * @var array<int, array{question: Question, correct: Answer, wrong: Answer}>
     */
    private array $questions = [];

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs($this->learner = User::factory()->create());

        $this->formation = Formation::factory()->create(['code' => 'LAR']);
        $module = Module::factory()->for($this->formation)->create(['number' => 1]);
        Course::factory()->count(2)->for($module)->create();
        $this->quiz = Quiz::factory()->for($this->formation)->create(['passing_score' => 70, 'max_attempts' => 2]);

        foreach (range(1, 4) as $position) {
            $question = Question::factory()->for($this->quiz)->create(['position' => $position]);
            $this->questions[] = [
                'question' => $question,
                'correct' => Answer::factory()->correct()->for($question)->create(),
                'wrong' => Answer::factory()->for($question)->create(),
            ];
        }
    }

    public function test_courses_require_an_enrollment_and_progress_is_tracked(): void
    {
        $course = $this->formation->courses()->first();

        $this->getJson("/api/courses/{$course->id}")->assertForbidden();

        $this->postJson("/api/formations/{$this->formation->id}/enroll")->assertCreated();

        $this->getJson("/api/courses/{$course->id}")->assertOk()->assertJsonPath('data.is_completed', false);

        $this->postJson("/api/courses/{$course->id}/complete")
            ->assertOk()
            ->assertJsonPath('progress.percent', 50);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.formations.0.progress.percent', 50);
    }

    public function test_quiz_answers_are_hidden_from_learners(): void
    {
        $this->postJson("/api/formations/{$this->formation->id}/enroll");

        $response = $this->postJson("/api/quizzes/{$this->quiz->id}/attempts")->assertCreated();

        $response->assertJsonCount(4, 'meta.questions')
            ->assertJsonMissingPath('meta.questions.0.answers.0.is_correct');
    }

    public function test_a_failed_quiz_can_be_retaken_and_a_passed_quiz_issues_a_certificate(): void
    {
        $this->postJson("/api/formations/{$this->formation->id}/enroll");

        $attemptId = $this->postJson("/api/quizzes/{$this->quiz->id}/attempts")->json('data.id');

        $this->postJson("/api/attempts/{$attemptId}/submit", ['answers' => $this->answersWithCorrectCount(2)])
            ->assertOk()
            ->assertJsonPath('data.score', 50)
            ->assertJsonPath('data.passed', false)
            ->assertJsonPath('data.status_label', 'À reprendre');

        $this->assertDatabaseCount('certificates', 0);

        $retryId = $this->postJson("/api/quizzes/{$this->quiz->id}/attempts")->assertCreated()->json('data.id');

        $this->postJson("/api/attempts/{$retryId}/submit", ['answers' => $this->answersWithCorrectCount(3)])
            ->assertOk()
            ->assertJsonPath('data.score', 75)
            ->assertJsonPath('data.passed', true);

        $certificate = Certificate::sole();
        $this->assertSame(75, $certificate->score);
        $this->assertStringStartsWith('PQ-LAR-', $certificate->number);

        $this->postJson("/api/quizzes/{$this->quiz->id}/attempts")->assertJsonValidationErrors('quiz');

        $this->get("/api/certificates/{$certificate->id}/download")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_an_attempt_cannot_be_submitted_twice(): void
    {
        $this->postJson("/api/formations/{$this->formation->id}/enroll");
        $attemptId = $this->postJson("/api/quizzes/{$this->quiz->id}/attempts")->json('data.id');

        $this->postJson("/api/attempts/{$attemptId}/submit", ['answers' => []])->assertOk();
        $this->postJson("/api/attempts/{$attemptId}/submit", ['answers' => []])->assertJsonValidationErrors('attempt');
    }

    public function test_the_maximum_number_of_attempts_is_enforced(): void
    {
        $this->postJson("/api/formations/{$this->formation->id}/enroll");

        foreach (range(1, 2) as $ignored) {
            $attemptId = $this->postJson("/api/quizzes/{$this->quiz->id}/attempts")->json('data.id');
            $this->postJson("/api/attempts/{$attemptId}/submit", ['answers' => []]);
        }

        $this->postJson("/api/quizzes/{$this->quiz->id}/attempts")->assertJsonValidationErrors('quiz');
    }

    public function test_learners_cannot_see_other_learners_attempts_or_certificates(): void
    {
        $other = User::factory()->create();
        $attempt = $this->quiz->attempts()->create([
            'user_id' => $other->id, 'attempt_number' => 1, 'passing_score' => 70, 'started_at' => now(),
        ]);
        $certificate = Certificate::factory()->for($other)->create();

        $this->getJson("/api/attempts/{$attempt->id}")->assertForbidden();
        $this->postJson("/api/attempts/{$attempt->id}/submit", ['answers' => []])->assertForbidden();
        $this->get("/api/certificates/{$certificate->id}/download")->assertForbidden();
    }

    /**
     * @return array<int, array{question_id: int, answer_ids: array<int, int>}>
     */
    private function answersWithCorrectCount(int $correctCount): array
    {
        return collect($this->questions)->map(fn (array $item, int $index): array => [
            'question_id' => $item['question']->id,
            'answer_ids' => [$index < $correctCount ? $item['correct']->id : $item['wrong']->id],
        ])->all();
    }
}
