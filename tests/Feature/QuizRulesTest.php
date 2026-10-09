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
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuizRulesTest extends TestCase
{
    use RefreshDatabase;

    private User $learner;

    private Formation $formation;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs($this->learner = User::factory()->create());

        $this->formation = Formation::factory()->create();
        $module = Module::factory()->for($this->formation)->create(['number' => 1]);
        Course::factory()->count(2)->for($module)->create();
        $this->formation->enrollments()->create(['user_id' => $this->learner->id]);
    }

    public function test_all_courses_must_be_completed_when_the_quiz_requires_it(): void
    {
        $quiz = $this->quizWithQuestions(['requires_course_completion' => true]);

        $this->getJson("/api/quizzes/{$quiz->id}")
            ->assertOk()
            ->assertJsonPath('meta.can_attempt', false)
            ->assertJsonPath('meta.progress.percent', 0);

        $this->postJson("/api/quizzes/{$quiz->id}/attempts")->assertJsonValidationErrors('quiz');

        foreach ($this->formation->courses as $course) {
            $this->postJson("/api/courses/{$course->id}/complete")->assertOk();
        }

        $this->getJson("/api/quizzes/{$quiz->id}")->assertJsonPath('meta.can_attempt', true);
        $this->postJson("/api/quizzes/{$quiz->id}/attempts")->assertCreated();
    }

    public function test_a_new_attempt_must_wait_for_the_retry_delay(): void
    {
        $quiz = $this->quizWithQuestions(['retry_delay_minutes' => 30]);

        $attemptId = $this->postJson("/api/quizzes/{$quiz->id}/attempts")->json('data.id');
        $this->postJson("/api/attempts/{$attemptId}/submit", ['answers' => []])->assertJsonPath('data.passed', false);

        $this->getJson("/api/quizzes/{$quiz->id}")
            ->assertJsonPath('meta.can_attempt', false)
            ->assertJsonPath('meta.next_attempt_at', fn (?string $date): bool => $date !== null);

        $this->postJson("/api/quizzes/{$quiz->id}/attempts")->assertJsonValidationErrors('quiz');

        $this->travel(31)->minutes();

        $this->postJson("/api/quizzes/{$quiz->id}/attempts")->assertCreated();
    }

    public function test_the_shuffled_order_is_kept_when_an_attempt_is_resumed(): void
    {
        $quiz = $this->quizWithQuestions(['shuffle_questions' => true, 'shuffle_answers' => true], questionCount: 8);

        $started = $this->postJson("/api/quizzes/{$quiz->id}/attempts")->assertCreated();
        $resumed = $this->getJson('/api/attempts/'.$started->json('data.id'))->assertOk();

        $this->assertSame($started->json('meta.questions.*.id'), $resumed->json('meta.questions.*.id'));
        $this->assertSame($started->json('meta.questions.*.answers.*.id'), $resumed->json('meta.questions.*.answers.*.id'));
        $this->assertEqualsCanonicalizing($quiz->questions()->pluck('id')->all(), $started->json('meta.questions.*.id'));
    }

    public function test_a_true_false_question_is_graded_like_a_single_choice(): void
    {
        $quiz = Quiz::factory()->for($this->formation)->create(['passing_score' => 100]);
        $question = Question::factory()->trueFalse()->for($quiz)->create();
        $true = Answer::factory()->correct()->for($question)->create(['text' => 'Vrai']);
        Answer::factory()->for($question)->create(['text' => 'Faux']);

        $attemptId = $this->postJson("/api/quizzes/{$quiz->id}/attempts")->json('data.id');

        $this->postJson("/api/attempts/{$attemptId}/submit", ['answers' => [['question_id' => $question->id, 'answer_ids' => [$true->id]]]])
            ->assertOk()
            ->assertJsonPath('data.score', 100)
            ->assertJsonPath('data.passed', true);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function quizWithQuestions(array $attributes = [], int $questionCount = 2): Quiz
    {
        $quiz = Quiz::factory()->for($this->formation)->create($attributes);

        foreach (range(1, $questionCount) as $position) {
            $question = Question::factory()->for($quiz)->create(['position' => $position]);
            Answer::factory()->correct()->for($question)->create(['position' => 1]);
            Answer::factory()->count(3)->for($question)->sequence(['position' => 2], ['position' => 3], ['position' => 4])->create();
        }

        return $quiz;
    }
}
