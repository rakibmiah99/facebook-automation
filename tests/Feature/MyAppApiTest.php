<?php

namespace Tests\Feature;

use App\Models\FacebookApp;
use App\Models\FacebookAppAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MyAppApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_endpoint_requires_a_token(): void
    {
        $this->getJson(route('api.my-app'))->assertUnauthorized();
    }

    public function test_it_returns_only_the_callers_own_apps_with_minimal_account_fields(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $app = FacebookApp::create([
            'user_id' => $user->id,
            'app_name' => 'My App',
            'app_id' => 'app-'.uniqid(),
            'app_secret' => 'secret',
            'app_token' => 'token',
            'status' => true,
        ]);

        $account = FacebookAppAccount::create([
            'facebook_app_id' => $app->id,
            'user_id' => $user->id,
            'account_id' => 'page-'.uniqid(),
            'account_name' => 'My Page',
            'access_token' => 'page-token',
        ]);

        FacebookApp::create([
            'user_id' => $otherUser->id,
            'app_name' => 'Someone Else\'s App',
            'app_id' => 'app-'.uniqid(),
            'app_secret' => 'secret',
            'app_token' => 'token',
            'status' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson(route('api.my-app'))
            ->assertOk()
            ->assertJson([
                'status' => true,
                'data' => [
                    ['id' => $app->id, 'app_name' => 'My App', 'accounts' => [['id' => $account->id, 'account_name' => 'My Page']]],
                ],
            ])
            ->assertJsonCount(1, 'data')
            ->assertJsonCount(1, 'data.0.accounts');

        $this->assertArrayNotHasKey('app_secret', $response->json('data.0'));
        $this->assertArrayNotHasKey('access_token', $response->json('data.0.accounts.0'));
    }

    public function test_an_app_with_no_accounts_returns_an_empty_accounts_array(): void
    {
        $user = User::factory()->create();

        FacebookApp::create([
            'user_id' => $user->id,
            'app_name' => 'No Accounts Yet',
            'app_id' => 'app-'.uniqid(),
            'app_secret' => 'secret',
            'app_token' => 'token',
            'status' => true,
        ]);

        Sanctum::actingAs($user);

        $this->getJson(route('api.my-app'))
            ->assertOk()
            ->assertJsonCount(0, 'data.0.accounts');
    }
}
