<?php

namespace Tests\Feature;

use App\Models\CustomTemplateRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CustomTemplateRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('r2');
    }

    public function test_user_can_create_a_custom_template_request_with_multiple_attachments(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('template-requests.store'), [
            'title' => 'Daily News Template',
            'aspect_ratio' => '1:1',
            'description' => 'A clean news template with our logo in the corner.',
            'attachments' => [
                UploadedFile::fake()->image('logo.png', 100, 100),
                UploadedFile::fake()->image('sample-design.jpg', 400, 400),
            ],
        ]);

        $request = CustomTemplateRequest::query()->where('title', 'Daily News Template')->firstOrFail();
        $response->assertRedirect(route('template-requests.show', $request));

        $this->assertSame($user->id, $request->user_id);
        $this->assertSame(CustomTemplateRequest::STATUS_SUBMITTED, $request->status);
        $this->assertCount(2, $request->attachments);

        foreach ($request->attachments as $attachment) {
            Storage::disk('r2')->assertExists($attachment->path);
        }
    }

    public function test_user_can_only_view_their_own_requests_in_the_index(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        CustomTemplateRequest::create([
            'user_id' => $userA->id,
            'title' => 'User A Request',
            'aspect_ratio' => '1:1',
            'description' => 'Request from A',
            'status' => CustomTemplateRequest::STATUS_SUBMITTED,
        ]);
        CustomTemplateRequest::create([
            'user_id' => $userB->id,
            'title' => 'User B Request',
            'aspect_ratio' => '1:1',
            'description' => 'Request from B',
            'status' => CustomTemplateRequest::STATUS_SUBMITTED,
        ]);

        $this->actingAs($userA)
            ->get(route('template-requests.index'))
            ->assertInertia(fn ($page) => $page->has('data.requests.data', 1)
                ->where('data.requests.data.0.title', 'User A Request'));
    }

    public function test_user_cannot_access_another_users_request_by_changing_the_id(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $request = CustomTemplateRequest::create([
            'user_id' => $userA->id,
            'title' => 'Private Request',
            'aspect_ratio' => '1:1',
            'description' => 'Request from A',
            'status' => CustomTemplateRequest::STATUS_SUBMITTED,
        ]);

        $this->actingAs($userB)
            ->get(route('template-requests.show', $request))
            ->assertForbidden();

        $this->actingAs($userB)
            ->post(route('template-requests.cancel', $request))
            ->assertForbidden();
    }

    public function test_user_can_cancel_their_own_pending_request(): void
    {
        $user = User::factory()->create();
        $request = CustomTemplateRequest::create([
            'user_id' => $user->id,
            'title' => 'My Request',
            'aspect_ratio' => '1:1',
            'description' => 'Description',
            'status' => CustomTemplateRequest::STATUS_SUBMITTED,
        ]);

        $this->actingAs($user)
            ->post(route('template-requests.cancel', $request))
            ->assertRedirect();

        $this->assertSame(CustomTemplateRequest::STATUS_CANCELLED, $request->refresh()->status);
    }

    public function test_admin_can_view_and_update_any_users_request(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        $user = User::factory()->create();
        $request = CustomTemplateRequest::create([
            'user_id' => $user->id,
            'title' => 'Needs Review',
            'aspect_ratio' => '4:5',
            'description' => 'Description',
            'status' => CustomTemplateRequest::STATUS_SUBMITTED,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.template-requests.show', $request))
            ->assertOk();

        $this->actingAs($admin)
            ->post(route('admin.template-requests.update', $request), [
                'status' => CustomTemplateRequest::STATUS_IN_PROGRESS,
                'admin_notes' => 'Working on it.',
            ])
            ->assertRedirect();

        $request->refresh();
        $this->assertSame(CustomTemplateRequest::STATUS_IN_PROGRESS, $request->status);
        $this->assertSame('Working on it.', $request->admin_notes);
        $this->assertSame($admin->id, $request->handled_by);
    }

    public function test_non_admin_cannot_manage_requests_via_the_admin_routes(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $request = CustomTemplateRequest::create([
            'user_id' => $otherUser->id,
            'title' => 'Some Request',
            'aspect_ratio' => '1:1',
            'description' => 'Description',
            'status' => CustomTemplateRequest::STATUS_SUBMITTED,
        ]);

        $this->actingAs($user)
            ->get(route('admin.template-requests.show', $request))
            ->assertForbidden();
    }
}
