<?php

namespace Tests\Feature;

use App\Models\Answer;
use App\Models\Course;
use App\Models\Formation;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ModuleQuizTest extends TestCase
{
    use RefreshDatabase;

    private User $learner;

    private Formation $formation;

    private Module $firstModule;

    private Module $secondModule;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs($this->learner = User::factory()->create());

        $this->formation = Formation::factory()->create();
        $this->firstModule = Module::factory()->for($this->formation)->create(['number' => 1]);
        $this->secondModule = Module::factory()->for($this->formation)->create(['number' => 2]);
        Course::factory()->count(2)->for($this->firstModule)->create();
        Course::factory()->for($this->secondModule)->create();
        $this->formation->enrollments()->create(['user_id' => $this->learner->id]);
    }

    public function test_a_module_quiz_opens_once_the_courses_of_its_module_are_completed(): void
    {
        $quiz = $this->quizWithQuestions($this->firstModule, ['requires_course_completion' => true]);

        $this->getJson("/api/quizzes/{$quiz->id}")
            ->assertOk()
            ->assertJsonPath('meta.can_attempt', false)
            ->assertJsonPath('meta.blocking_reason', 'Terminez tous les cours du module avant de passer son quiz.')
            ->assertJsonPath('meta.progress.total_courses', 2);

        foreach ($this->firstModule->courses as $course) {
            $this->postJson("/api/courses/{$course->id}/complete")->assertOk();
        }

        $this->getJson("/api/quizzes/{$quiz->id}")
            ->assertJsonPath('meta.can_attempt', true)
            ->assertJsonPath('meta.progress.percent', 100);
        $this->postJson("/api/quizzes/{$quiz->id}/attempts")->assertCreated();
    }

    public function test_the_final_evaluation_requires_every_module_quiz_to_be_passed(): void
    {
        $firstQuiz = $this->quizWithQuestions($this->firstModule);
        $this->quizWithQuestions($this->secondModule);
        $finalQuiz = $this->quizWithQuestions(null);

        $this->getJson("/api/quizzes/{$finalQuiz->id}")
            ->assertJsonPath('meta.can_attempt', false)
            ->assertJsonPath('meta.blocking_reason', 'Réussissez d\'abord le quiz de chaque module avant l\'évaluation finale (reste : module 1, module 2).');

        $this->pass($firstQuiz);

        $this->getJson("/api/quizzes/{$finalQuiz->id}")
            ->assertJsonPath('meta.blocking_reason', 'Réussissez d\'abord le quiz de chaque module avant l\'évaluation finale (reste : module 2).');
        $this->postJson("/api/quizzes/{$finalQuiz->id}/attempts")->assertJsonValidationErrors('quiz');
    }

    public function test_the_certificate_is_only_issued_by_the_final_evaluation(): void
    {
        $firstQuiz = $this->quizWithQuestions($this->firstModule);
        $secondQuiz = $this->quizWithQuestions($this->secondModule);
        $finalQuiz = $this->quizWithQuestions(null);

        $this->pass($firstQuiz)->assertJsonPath('data.passed', true)->assertJsonPath('data.certificate', null);
        $this->pass($secondQuiz);
        $this->assertDatabaseCount('certificates', 0);

        $this->pass($finalQuiz)->assertJsonPath('data.passed', true);

        $this->assertDatabaseHas('certificates', [
            'user_id' => $this->learner->id,
            'formation_id' => $this->formation->id,
            'score' => 100,
        ]);
    }

    public function test_the_formation_page_shows_the_module_quizzes_and_whether_they_are_passed(): void
    {
        $firstQuiz = $this->quizWithQuestions($this->firstModule);
        $this->quizWithQuestions($this->secondModule, ['is_published' => false]);
        $finalQuiz = $this->quizWithQuestions(null);

        $this->pass($firstQuiz);

        $this->getJson("/api/formations/{$this->formation->id}")
            ->assertOk()
            ->assertJsonPath('data.modules.0.quiz.id', $firstQuiz->id)
            ->assertJsonPath('data.modules.0.quiz.is_passed', true)
            ->assertJsonPath('data.modules.1.quiz', null)
            ->assertJsonPath('data.quiz.id', $finalQuiz->id)
            ->assertJsonPath('data.quiz.is_passed', false);
    }

    public function test_staff_create_one_quiz_per_module_and_one_final_evaluation(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $quiz = ['title' => 'Quiz', 'passing_score' => 60, 'formation_id' => $this->formation->id];
        $otherModule = Module::factory()->create();

        $this->postJson('/api/admin/quizzes', [...$quiz, 'module_id' => $this->firstModule->id])
            ->assertCreated()
            ->assertJsonPath('data.is_final', false);
        $this->postJson('/api/admin/quizzes', [...$quiz, 'module_id' => $this->firstModule->id])->assertJsonValidationErrors('module_id');
        $this->postJson('/api/admin/quizzes', [...$quiz, 'module_id' => $otherModule->id])->assertJsonValidationErrors('module_id');

        $this->postJson('/api/admin/quizzes', [...$quiz, 'passing_score' => 70])
            ->assertCreated()
            ->assertJsonPath('data.is_final', true);
        $this->postJson('/api/admin/quizzes', $quiz)->assertJsonValidationErrors('formation_id');

        $this->getJson("/api/admin/formations/{$this->formation->id}")
            ->assertJsonPath('data.modules.0.quiz.module_id', $this->firstModule->id)
            ->assertJsonPath('data.quiz.module_id', null);
    }

    /**
     * Réussit le quiz en cochant toutes les bonnes réponses.
     */
    private function pass(Quiz $quiz): TestResponse
    {
        $attempt = $this->postJson("/api/quizzes/{$quiz->id}/attempts")->assertCreated();

        $answers = $quiz->questions()->with('answers')->get()->map(fn (Question $question): array => [
            'question_id' => $question->id,
            'answer_ids' => $question->answers->where('is_correct', true)->modelKeys(),
        ]);

        return $this->postJson('/api/attempts/'.$attempt->json('data.id').'/submit', ['answers' => $answers->all()])->assertOk();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function quizWithQuestions(?Module $module, array $attributes = []): Quiz
    {
        $quiz = Quiz::factory()->for($this->formation)->create([
            'module_id' => $module?->id,
            'requires_course_completion' => false,
            ...$attributes,
        ]);

        foreach (range(1, 2) as $position) {
            $question = Question::factory()->for($quiz)->create(['position' => $position]);
            Answer::factory()->correct()->for($question)->create(['position' => 1]);
            Answer::factory()->for($question)->create(['position' => 2]);
        }

        return $quiz;
    }
}
