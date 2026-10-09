<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_the_admin_area(): void
    {
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
    }

    public function test_learners_cannot_access_the_admin_area(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/admin/dashboard')->assertForbidden();
        $this->postJson('/api/admin/formations', ['title' => 'Laravel'])->assertForbidden();
    }

    public function test_admins_can_access_the_admin_area(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/admin/dashboard')->assertOk();
    }
}
