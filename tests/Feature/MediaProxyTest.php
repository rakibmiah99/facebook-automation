<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MediaProxyTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_streams_a_remote_image_back_same_origin(): void
    {
        Http::fake([
            'cdn.example.com/*' => Http::response('fake-image-bytes', 200, ['Content-Type' => 'image/png']),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get(route('media.proxy', ['url' => 'https://cdn.example.com/pattern.png']));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'image/png');
        $this->assertSame('fake-image-bytes', $response->getContent());
    }

    public function test_it_rejects_a_non_image_response(): void
    {
        Http::fake([
            'cdn.example.com/*' => Http::response('<html></html>', 200, ['Content-Type' => 'text/html']),
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('media.proxy', ['url' => 'https://cdn.example.com/page.html']))
            ->assertStatus(422);
    }

    public function test_it_refuses_to_fetch_a_private_address(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('media.proxy', ['url' => 'http://127.0.0.1/secret']))
            ->assertStatus(403);
    }

    public function test_it_requires_authentication(): void
    {
        $this->get(route('media.proxy', ['url' => 'https://cdn.example.com/pattern.png']))
            ->assertRedirect(route('login'));
    }
}
