<?php

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs($this->admin = User::factory()->admin()->create());
    }

    public function test_admin_can_list_and_search_users(): void
    {
        User::factory()->create(['name' => 'Mounirath ISSA']);
        User::factory()->count(3)->create();

        $this->getJson('/api/admin/users?search=Mounirath')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Mounirath ISSA');
    }

    public function test_admin_can_create_a_user(): void
    {
        $this->postJson('/api/admin/users', [
            'name' => 'Nouvel Admin',
            'email' => 'admin2@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ])->assertCreated()->assertJsonPath('data.role', 'admin');
    }

    public function test_admin_can_disable_a_user_which_revokes_the_tokens(): void
    {
        $learner = User::factory()->create();
        $learner->createToken('auth');

        $this->putJson("/api/admin/users/{$learner->id}", [
            'name' => $learner->name,
            'email' => $learner->email,
            'role' => 'learner',
            'is_active' => false,
        ])->assertOk()->assertJsonPath('data.is_active', false);

        $this->assertCount(0, $learner->tokens()->get());
    }

    public function test_admin_cannot_demote_or_delete_themself(): void
    {
        $this->putJson("/api/admin/users/{$this->admin->id}", [
            'name' => $this->admin->name,
            'email' => $this->admin->email,
            'role' => 'learner',
        ])->assertUnprocessable();

        $this->deleteJson("/api/admin/users/{$this->admin->id}")->assertUnprocessable();
    }

    public function test_admin_can_delete_a_user(): void
    {
        $learner = User::factory()->create();

        $this->deleteJson("/api/admin/users/{$learner->id}")->assertNoContent();

        $this->assertModelMissing($learner);
    }

    public function test_admin_can_follow_a_learner_progress(): void
    {
        $learner = User::factory()->create();
        $module = Module::factory()->create();
        $courses = Course::factory()->count(4)->for($module)->create();
        Enrollment::factory()->for($learner)->for($module->formation)->create();
        $learner->completedCourses()->attach($courses->first(), ['completed_at' => now()]);

        $this->getJson("/api/admin/users/{$learner->id}/progress")
            ->assertOk()
            ->assertJsonPath('data.formations.0.progress.completed_courses', 1)
            ->assertJsonPath('data.formations.0.progress.total_courses', 4)
            ->assertJsonPath('data.formations.0.progress.percent', 25);

        $this->getJson("/api/admin/formations/{$module->formation_id}/learners")
            ->assertOk()
            ->assertJsonPath('data.0.id', $learner->id)
            ->assertJsonPath('data.0.completed_courses_count', 1)
            ->assertJsonPath('meta.total_courses', 4);
    }
}
