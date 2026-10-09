<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CertificateVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_verify_a_certificate_by_its_number(): void
    {
        $certificate = Certificate::factory()
            ->for(User::factory()->create(['name' => 'Camille Exemple', 'email' => 'camille@example.com']))
            ->for(Formation::factory()->create(['title' => 'Laravel', 'code' => 'LAR']))
            ->create(['score' => 82]);

        $this->getJson("/api/certificates/verify/{$certificate->refresh()->number}")
            ->assertOk()
            ->assertJsonPath('data.is_valid', true)
            ->assertJsonPath('data.holder_name', 'Camille Exemple')
            ->assertJsonPath('data.formation_title', 'Laravel')
            ->assertJsonPath('data.score', 82)
            ->assertJsonMissingPath('data.email');
    }

    public function test_a_revoked_certificate_is_reported_as_invalid(): void
    {
        $certificate = Certificate::factory()->create(['revoked_at' => now(), 'revocation_reason' => 'Fraude']);

        $this->getJson("/api/certificates/verify/{$certificate->refresh()->number}")
            ->assertOk()
            ->assertJsonPath('data.is_valid', false)
            ->assertJsonMissingPath('data.revocation_reason');
    }

    public function test_an_unknown_number_returns_not_found(): void
    {
        $this->getJson('/api/certificates/verify/PQ-XXX-2026-99999')->assertNotFound();
    }
}
