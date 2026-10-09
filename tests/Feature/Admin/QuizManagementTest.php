<?php

namespace Tests\Feature\Admin;

use App\Models\Answer;
use App\Models\Formation;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuizManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->admin()->create());
    }

    public function test_admin_can_create_a_quiz_with_a_minimum_score(): void
    {
        $formation = Formation::factory()->create();

        $this->postJson('/api/admin/quizzes', [
            'formation_id' => $formation->id,
            'title' => 'Évaluation finale',
            'passing_score' => 70,
            'time_limit_minutes' => 30,
            'is_published' => true,
        ])->assertCreated()->assertJsonPath('data.passing_score', 70);

        $this->postJson('/api/admin/quizzes', [
            'formation_id' => $formation->id,
            'title' => 'Second quiz',
            'passing_score' => 50,
        ])->assertJsonValidationErrors('formation_id');
    }

    public function test_admin_can_create_a_question_with_its_answers(): void
    {
        $quiz = Quiz::factory()->create();

        $this->postJson("/api/admin/quizzes/{$quiz->id}/questions", [
            'text' => 'Quel est l\'ORM de Laravel ?',
            'type' => 'single',
            'points' => 2,
            'position' => 1,
            'answers' => [
                ['text' => 'Eloquent', 'is_correct' => true],
                ['text' => 'Doctrine', 'is_correct' => false],
            ],
        ])->assertCreated()
            ->assertJsonCount(2, 'data.answers')
            ->assertJsonPath('data.answers.0.is_correct', true);
    }

    public function test_a_question_needs_a_consistent_number_of_correct_answers(): void
    {
        $quiz = Quiz::factory()->create();
        $payload = ['text' => 'Question ?', 'type' => 'single', 'points' => 1, 'position' => 1];

        $this->postJson("/api/admin/quizzes/{$quiz->id}/questions", [...$payload, 'answers' => [
            ['text' => 'A', 'is_correct' => false],
            ['text' => 'B', 'is_correct' => false],
        ]])->assertJsonValidationErrors('answers');

        $this->postJson("/api/admin/quizzes/{$quiz->id}/questions", [...$payload, 'answers' => [
            ['text' => 'A', 'is_correct' => true],
            ['text' => 'B', 'is_correct' => true],
        ]])->assertJsonValidationErrors('answers');
    }

    public function test_updating_a_question_synchronises_its_answers(): void
    {
        $question = Question::factory()->create();
        $kept = Answer::factory()->correct()->for($question)->create(['text' => 'Ancienne']);
        $removed = Answer::factory()->for($question)->create();

        $this->putJson("/api/admin/questions/{$question->id}", [
            'text' => 'Question modifiée ?',
            'type' => 'single',
            'points' => 1,
            'position' => 1,
            'answers' => [
                ['id' => $kept->id, 'text' => 'Modifiée', 'is_correct' => true],
                ['text' => 'Nouvelle', 'is_correct' => false],
            ],
        ])->assertOk()->assertJsonCount(2, 'data.answers');

        $this->assertSame('Modifiée', $kept->fresh()->text);
        $this->assertModelMissing($removed);
    }

    public function test_admin_can_add_answers_one_by_one(): void
    {
        $question = Question::factory()->create();
        Answer::factory()->correct()->for($question)->create();

        $this->postJson("/api/admin/questions/{$question->id}/answers", ['text' => 'Autre bonne', 'is_correct' => true, 'position' => 2])
            ->assertJsonValidationErrors('is_correct');

        $this->postJson("/api/admin/questions/{$question->id}/answers", ['text' => 'Mauvaise', 'is_correct' => false, 'position' => 2])
            ->assertCreated();
    }

    public function test_admin_quiz_detail_contains_correct_answers(): void
    {
        $question = Question::factory()->create();
        Answer::factory()->correct()->for($question)->create();

        $this->getJson("/api/admin/quizzes/{$question->quiz_id}")
            ->assertOk()
            ->assertJsonPath('data.questions_count', 1)
            ->assertJsonPath('data.questions.0.answers.0.is_correct', true);
    }

    public function test_a_true_false_question_needs_exactly_two_answers_and_one_correct(): void
    {
        $quiz = Quiz::factory()->create();
        $payload = ['text' => 'Laravel est un framework PHP.', 'type' => 'true_false', 'points' => 1, 'position' => 1];

        $this->postJson("/api/admin/quizzes/{$quiz->id}/questions", [...$payload, 'answers' => [
            ['text' => 'Vrai', 'is_correct' => true], ['text' => 'Faux', 'is_correct' => false], ['text' => 'Peut-être', 'is_correct' => false],
        ]])->assertJsonValidationErrors('answers');

        $this->postJson("/api/admin/quizzes/{$quiz->id}/questions", [...$payload, 'answers' => [
            ['text' => 'Vrai', 'is_correct' => true], ['text' => 'Faux', 'is_correct' => true],
        ]])->assertJsonValidationErrors('answers');

        $this->postJson("/api/admin/quizzes/{$quiz->id}/questions", [...$payload, 'answers' => [
            ['text' => 'Vrai', 'is_correct' => true], ['text' => 'Faux', 'is_correct' => false],
        ]])->assertCreated()->assertJsonPath('data.type', 'true_false');
    }
}
