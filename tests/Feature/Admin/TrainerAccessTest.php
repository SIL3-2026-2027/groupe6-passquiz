<?php

namespace Tests\Feature\Admin;

use App\Models\Certificate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TrainerAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->trainer()->create());
    }

    public function test_trainers_can_manage_the_learning_content(): void
    {
        $this->postJson('/api/admin/formations', [
            'title' => 'Laravel',
            'code' => 'LAR',
            'level' => 'beginner',
        ])->assertCreated();

        $this->getJson('/api/admin/formations')->assertOk();
        $this->getJson('/api/admin/quizzes')->assertOk();
        $this->getJson('/api/admin/attempts')->assertOk();
    }

    public function test_trainers_cannot_manage_users_or_certificates(): void
    {
        $certificate = Certificate::factory()->create();

        $this->getJson('/api/admin/users')->assertForbidden();
        $this->getJson('/api/admin/certificates')->assertForbidden();
        $this->postJson("/api/admin/certificates/{$certificate->id}/revoke", ['reason' => 'Test'])->assertForbidden();
    }
}
