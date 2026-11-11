<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Formation;
use App\Models\Module;
use App\Models\User;
use App\Notifications\CertificateIssued;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_learner_is_notified_when_an_admin_issues_or_restores_their_certificate(): void
    {
        $learner = User::factory()->create();
        $formation = Formation::factory()->create(['title' => 'React']);
        Sanctum::actingAs(User::factory()->admin()->create());

        $certificateId = $this->postJson('/api/admin/certificates', [
            'user_id' => $learner->id,
            'formation_id' => $formation->id,
            'score' => 85,
        ])->assertCreated()->json('data.id');

        $this->postJson("/api/admin/certificates/{$certificateId}/revoke", ['reason' => 'Erreur'])->assertOk();
        $this->postJson("/api/admin/certificates/{$certificateId}/restore")->assertOk();

        Sanctum::actingAs($learner);

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.unread_count', 2)
            ->assertJsonPath('data.0.title', 'Certificat délivré')
            ->assertJsonPath('data.0.url', '/certificates')
            ->assertJsonPath('data.0.message', fn (string $message): bool => str_contains($message, 'React'));
    }

    public function test_admins_and_the_formation_trainer_are_notified_once_when_a_learner_completes_a_course(): void
    {
        $admin = User::factory()->admin()->create();
        $inactiveAdmin = User::factory()->admin()->inactive()->create();
        $trainer = User::factory()->trainer()->create();
        $otherTrainer = User::factory()->trainer()->create();
        $learner = User::factory()->create(['name' => 'Awa Koffi']);

        $formation = Formation::factory()->for($trainer, 'trainer')->create();
        $course = Course::factory()->for(Module::factory()->for($formation))->create(['title' => 'Pourquoi React ?']);
        $formation->enrollments()->create(['user_id' => $learner->id]);

        Sanctum::actingAs($learner);
        $this->postJson("/api/courses/{$course->id}/complete")->assertOk();
        $this->postJson("/api/courses/{$course->id}/complete")->assertOk();

        $this->assertSame(1, $admin->notifications()->count());
        $this->assertSame(1, $trainer->notifications()->count());
        $this->assertSame(0, $inactiveAdmin->notifications()->count());
        $this->assertSame(0, $otherTrainer->notifications()->count());
        $this->assertSame(0, $learner->notifications()->count());

        Sanctum::actingAs($admin);

        $this->getJson('/api/notifications')
            ->assertJsonPath('data.0.title', 'Cours terminé')
            ->assertJsonPath('data.0.message', 'Awa Koffi a terminé le cours « Pourquoi React ? » (formation '.$formation->title.', module '.$course->module->number.').')
            ->assertJsonPath('data.0.url', "/admin/users/{$learner->id}");
    }

    public function test_users_mark_their_own_notifications_as_read(): void
    {
        $learner = User::factory()->create();
        $certificates = Certificate::factory()->count(2)->for($learner)->create();
        $certificates->each(fn (Certificate $certificate) => $learner->notify(new CertificateIssued($certificate)));
        $first = $learner->notifications()->first();

        Sanctum::actingAs(User::factory()->create());
        $this->postJson("/api/notifications/{$first->id}/read")->assertForbidden();

        Sanctum::actingAs($learner);
        $this->postJson("/api/notifications/{$first->id}/read")->assertOk()->assertJsonPath('meta.unread_count', 1);
        $this->postJson('/api/notifications/read-all')->assertOk()->assertJsonPath('meta.unread_count', 0);
        $this->assertSame(0, $learner->unreadNotifications()->count());
    }
}
