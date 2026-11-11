<?php

namespace Database\Seeders;

use App\Enums\FormationLevel;
use App\Enums\QuestionType;
use App\Enums\UserRole;
use App\Models\Formation;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Http\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Installe une formation à partir des fiches de saisie rédigées par l'équipe, converties dans
 * database/seeders/data/{slug}/formation.json, avec les PDF de cours du même dossier :
 * modules, cours (PDF joint au cours 1 du module quand il existe), quiz de chaque module et évaluation finale.
 *
 * Les modules et les quiz de modules existants de la formation sont remplacés. L'évaluation finale
 * n'est remplacée que si sa fiche existe ; sinon l'évaluation existante est conservée en brouillon.
 */
abstract class FormationContentSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * @return array{slug: string, title: string, code: string, description: string}
     */
    abstract protected function formation(): array;

    public function run(): void
    {
        $attributes = $this->formation();
        $dataPath = __DIR__.'/data/'.$attributes['slug'];

        /** @var array{modules: array<int, array<string, mixed>>, final_quiz: array<string, mixed>|null} $data */
        $data = json_decode(file_get_contents($dataPath.'/formation.json'), true, flags: JSON_THROW_ON_ERROR);

        DB::transaction(function () use ($attributes, $data, $dataPath): void {
            $formation = Formation::firstOrNew(['slug' => $attributes['slug']]);
            $formation->fill([...$attributes, 'level' => FormationLevel::Beginner, 'is_published' => true]);
            $formation->trainer_id ??= User::where('role', UserRole::Trainer)->oldest('id')->value('id');
            $formation->save();

            $this->removeModules($formation);

            foreach ($data['modules'] as $moduleData) {
                $module = $formation->modules()->create([
                    'number' => $moduleData['number'],
                    'title' => $moduleData['title'],
                    'description' => $moduleData['description'],
                ]);

                foreach ($moduleData['courses'] as $courseData) {
                    $module->courses()->create([
                        ...$courseData,
                        'pdf_path' => $courseData['position'] === 1 && $moduleData['pdf'] !== null
                            ? $this->storePdf($dataPath.'/'.$moduleData['pdf'], $attributes['slug'])
                            : null,
                    ]);
                }

                $this->createQuiz($formation, $moduleData['quiz'], $module->id);
            }

            if ($data['final_quiz'] !== null) {
                $formation->quiz()->delete();
                $this->createQuiz($formation, $data['final_quiz']);
            } else {
                $formation->quiz()->update(['is_published' => false]);
            }
        });
    }

    private function removeModules(Formation $formation): void
    {
        Storage::disk('public')->delete(
            $formation->courses()->whereNotNull('pdf_path')->pluck('pdf_path')->all()
        );

        $formation->quizzes()->whereNotNull('module_id')->delete();
        $formation->modules()->delete();
    }

    private function storePdf(string $path, string $prefix): string
    {
        return Storage::disk('public')->putFileAs('courses', new File($path), $prefix.'-'.strtolower(basename($path)));
    }

    /**
     * @param  array{title: string, passing_score: int, time_limit_minutes: int, max_attempts: int, retry_delay_minutes: int, questions: array<int, array{text: string, type: string, points: int, explanation: ?string, answers: array<int, array{text: string, is_correct: bool}>}>}  $quizData
     */
    private function createQuiz(Formation $formation, array $quizData, ?int $moduleId = null): Quiz
    {
        $quiz = $formation->quizzes()->create([
            'module_id' => $moduleId,
            'title' => $quizData['title'],
            'description' => $moduleId === null
                ? 'Évaluation finale sur l\'ensemble des modules. Accessible une fois le quiz de chaque module réussi.'
                : 'Quiz du module. Accessible une fois tous les cours du module terminés.',
            'passing_score' => $quizData['passing_score'],
            'time_limit_minutes' => $quizData['time_limit_minutes'],
            'max_attempts' => $quizData['max_attempts'],
            'retry_delay_minutes' => $quizData['retry_delay_minutes'],
            'requires_course_completion' => true,
            'shuffle_questions' => true,
            'shuffle_answers' => true,
            'is_published' => true,
        ]);

        foreach ($quizData['questions'] as $index => $questionData) {
            $question = $quiz->questions()->create([
                'text' => $questionData['text'],
                'type' => QuestionType::from($questionData['type']),
                'points' => $questionData['points'],
                'position' => $index + 1,
                'explanation' => $questionData['explanation'],
            ]);

            foreach ($questionData['answers'] as $answerIndex => $answerData) {
                $question->answers()->create([...$answerData, 'position' => $answerIndex + 1]);
            }
        }

        return $quiz;
    }
}
