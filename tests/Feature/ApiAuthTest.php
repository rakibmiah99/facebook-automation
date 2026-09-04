<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_credentials_return_the_user_and_a_bearer_token(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $response = $this->postJson(route('api.login'), [
            'email' => $user->email,
            'password' => 'correct-password',
        ])
            ->assertOk()
            ->assertJson([
                'status' => true,
                'data' => ['user' => ['id' => $user->id, 'email' => $user->email]],
            ])
            ->assertJsonStructure(['status', 'message', 'data' => ['user', 'token']]);

        $token = $response->json('data.token');
        $this->assertNotEmpty($token);

        $this->getJson(route('api.templates.index'), [
            'Authorization' => "Bearer {$token}",
        ])->assertOk();
    }

    public function test_invalid_password_fails_with_a_validation_error(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $this->postJson(route('api.login'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_unknown_email_fails_with_a_validation_error(): void
    {
        $this->postJson(route('api.login'), [
            'email' => 'nobody@example.com',
            'password' => 'whatever',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_email_and_password_are_required(): void
    {
        $this->postJson(route('api.login'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }
}
