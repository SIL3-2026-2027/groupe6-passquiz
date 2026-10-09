<?php

namespace Tests\Feature\Admin;

use App\Models\Certificate;
use App\Models\Formation;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CertificateManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->admin()->create());
    }

    public function test_admin_can_issue_a_certificate_manually(): void
    {
        $learner = User::factory()->create();
        $formation = Formation::factory()->create(['code' => 'LAR']);

        $response = $this->postJson('/api/admin/certificates', [
            'user_id' => $learner->id,
            'formation_id' => $formation->id,
            'score' => 82,
        ]);

        $certificate = Certificate::first();

        $response->assertCreated()
            ->assertJsonPath('data.number', sprintf('PQ-LAR-%s-%05d', now()->year, $certificate->id));

        $this->postJson('/api/admin/certificates', [
            'user_id' => $learner->id,
            'formation_id' => $formation->id,
            'score' => 90,
        ])->assertJsonValidationErrors('formation_id');
    }

    public function test_admin_can_revoke_and_restore_a_certificate(): void
    {
        $certificate = Certificate::factory()->create();

        $this->postJson("/api/admin/certificates/{$certificate->id}/revoke", ['reason' => 'Fraude'])
            ->assertOk()
            ->assertJsonPath('data.is_revoked', true)
            ->assertJsonPath('data.revocation_reason', 'Fraude');

        $this->getJson('/api/admin/certificates?status=revoked')->assertJsonCount(1, 'data');

        $this->postJson("/api/admin/certificates/{$certificate->id}/restore")
            ->assertOk()
            ->assertJsonPath('data.is_revoked', false);
    }

    public function test_admin_can_download_a_certificate_pdf(): void
    {
        $certificate = Certificate::factory()->create();

        $this->get("/api/admin/certificates/{$certificate->id}/download")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_admin_can_delete_a_certificate(): void
    {
        $certificate = Certificate::factory()->create();

        $this->deleteJson("/api/admin/certificates/{$certificate->id}")->assertNoContent();

        $this->assertModelMissing($certificate);
    }

    public function test_admin_can_consult_results(): void
    {
        QuizAttempt::factory()->create(['score' => 82, 'passed' => true]);
        QuizAttempt::factory()->create(['score' => 55, 'passed' => false]);
        QuizAttempt::factory()->inProgress()->create();

        $this->getJson('/api/admin/attempts')->assertOk()->assertJsonCount(3, 'data');
        $this->getJson('/api/admin/attempts?status=passed')->assertJsonCount(1, 'data')->assertJsonPath('data.0.status_label', 'Réussi');
        $this->getJson('/api/admin/attempts?status=failed')->assertJsonCount(1, 'data')->assertJsonPath('data.0.status_label', 'À reprendre');
    }
}
