<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_visitor_can_register_as_a_learner(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Mounirath ISSA',
            'email' => 'mounirath@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.role', 'learner');
    }

    public function test_a_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_login_fails_with_a_wrong_password(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_a_disabled_account_cannot_login(): void
    {
        $user = User::factory()->inactive()->create();

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_a_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $this->withToken($token)->postJson('/api/auth/logout')->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_a_reset_link_can_be_requested(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/auth/forgot-password', ['email' => $user->email])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_the_password_can_be_reset_with_a_valid_token(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/auth/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user): bool {
            $this->postJson('/api/auth/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ])->assertOk();

            return true;
        });

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'new-password'])->assertOk();
    }

    public function test_a_user_can_update_the_profile(): void
    {
        Sanctum::actingAs($user = User::factory()->create());

        $this->putJson('/api/profile', ['name' => 'Nouveau Nom', 'email' => 'nouveau@example.com'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Nouveau Nom');

        $this->assertSame('nouveau@example.com', $user->fresh()->email);
    }

    public function test_a_user_can_change_the_password(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $this->withToken($token)->putJson('/api/profile/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'new-password'])->assertOk();
    }

    public function test_changing_the_password_requires_the_current_password(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->putJson('/api/profile/password', [
            'current_password' => 'wrong',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertJsonValidationErrors('current_password');
    }
}
