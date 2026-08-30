<?php

namespace Tests\Feature;

use App\Models\FacebookApp;
use App\Models\FacebookAppAccount;
use App\Models\Template;
use App\Models\TemplateGeneration;
use App\Models\User;
use App\Repositories\FacebookRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Tests\Fakes\FakeFacebookRepository;
use Tests\TestCase;

class TemplateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('r2');
        $this->app->bind(FacebookRepositoryInterface::class, FakeFacebookRepository::class);
    }

    public function test_common_template_is_visible_to_any_authenticated_user(): void
    {
        $this->createCommonTemplate();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('templates.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('data.common_templates', 1));
    }

    public function test_user_cannot_see_another_users_private_template_in_the_index(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $this->createPrivateTemplate($userB);

        $this->actingAs($userA)
            ->get(route('templates.index'))
            ->assertInertia(fn ($page) => $page->has('data.my_templates', 0));
    }

    public function test_user_cannot_access_another_users_private_template_by_changing_the_id(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $template = $this->createPrivateTemplate($userA);

        $this->actingAs($userB)
            ->get(route('templates.edit', ['template' => $template->id]))
            ->assertForbidden();

        $this->actingAs($userB)
            ->post(route('templates.generate', ['template' => $template->id]), [
                'generated_image' => UploadedFile::fake()->image('generated.png'),
            ])
            ->assertForbidden();
    }

    public function test_owner_can_access_their_own_private_template(): void
    {
        $owner = User::factory()->create();
        $template = $this->createPrivateTemplate($owner);

        $this->actingAs($owner)
            ->get(route('templates.edit', ['template' => $template->id]))
            ->assertOk();
    }

    public function test_customizing_a_common_template_does_not_modify_the_master_template(): void
    {
        $template = $this->createCommonTemplate();
        $user = User::factory()->create();
        $originalConfig = $template->config;

        $this->actingAs($user)
            ->post(route('templates.generate', ['template' => $template->id]), [
                'values' => ['headline' => 'My Custom Headline'],
                'generated_image' => UploadedFile::fake()->image('generated.png', 200, 200),
            ])
            ->assertRedirect();

        $template->refresh();
        $this->assertSame($originalConfig, $template->config);
    }

    public function test_generate_stores_the_client_rendered_image_via_the_media_helper(): void
    {
        $template = $this->createCommonTemplate();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('templates.generate', ['template' => $template->id]), [
                'values' => ['headline' => 'Hello World'],
                'generated_image' => UploadedFile::fake()->image('generated.png', 200, 200),
            ])
            ->assertRedirect();

        $generated = session('generated');
        $this->assertInstanceOf(TemplateGeneration::class, $generated);
        Storage::disk('r2')->assertExists($generated->path);

        [$width, $height] = getimagesizefromstring(Storage::disk('r2')->get($generated->path));
        $this->assertSame(200, $width);
        $this->assertSame(200, $height);

        $this->assertDatabaseHas('template_generations', [
            'id' => $generated->id,
            'template_id' => $template->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_a_missing_generated_image_fails_validation_and_is_logged(): void
    {
        Log::spy();

        $template = $this->createCommonTemplate();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('templates.generate', ['template' => $template->id]), [
                'values' => ['headline' => 'Hello World'],
            ])
            ->assertSessionHasErrors('generated_image');

        Log::shouldHaveReceived('error')->once();
    }

    public function test_generation_appears_in_the_edit_pages_history_list(): void
    {
        $template = $this->createCommonTemplate();
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('templates.generate', ['template' => $template->id]), [
            'values' => ['headline' => 'Hello World'],
            'generated_image' => UploadedFile::fake()->image('generated.png', 200, 200),
        ]);

        $this->actingAs($user)
            ->get(route('templates.edit', ['template' => $template->id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('data.generations', 1)
                ->where('data.generations.0.is_posted', false),
            );
    }

    public function test_generated_image_creates_a_post_through_the_existing_facebook_pipeline(): void
    {
        $template = $this->createCommonTemplate();
        $user = User::factory()->create();
        $account = $this->createAccountFor($user);

        $this->actingAs($user)->post(route('templates.generate', ['template' => $template->id]), [
            'values' => ['headline' => 'Hello World'],
            'generated_image' => UploadedFile::fake()->image('generated.png', 200, 200),
        ]);
        $generated = session('generated');

        $this->actingAs($user)
            ->post(route('templates.generations.post', ['template' => $template->id, 'generation' => $generated->id]), [
                'account_ids' => [$account->id],
                'caption' => 'Test caption',
                'is_scheduled' => false,
            ])
            ->assertRedirect(route('posts.index'));

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'template_id' => $template->id,
            'template_generation_id' => $generated->id,
            'facebook_app_account_id' => $account->id,
            'is_published' => true,
        ]);
    }

    public function test_a_generation_can_be_posted_again_later_to_more_accounts(): void
    {
        $template = $this->createCommonTemplate();
        $user = User::factory()->create();
        $accountA = $this->createAccountFor($user);
        $accountB = $this->createAccountFor($user);

        $this->actingAs($user)->post(route('templates.generate', ['template' => $template->id]), [
            'values' => ['headline' => 'Hello World'],
            'generated_image' => UploadedFile::fake()->image('generated.png', 200, 200),
        ]);
        $generated = session('generated');

        $this->actingAs($user)->post(route('templates.generations.post', ['template' => $template->id, 'generation' => $generated->id]), [
            'account_ids' => [$accountA->id],
            'is_scheduled' => false,
        ]);

        $this->actingAs($user)
            ->post(route('templates.generations.post', ['template' => $template->id, 'generation' => $generated->id]), [
                'account_ids' => [$accountB->id],
                'is_scheduled' => false,
            ])
            ->assertRedirect(route('posts.index'));

        $this->assertSame(2, $generated->posts()->count());
    }

    public function test_scheduling_a_template_generated_post_does_not_publish_immediately(): void
    {
        $template = $this->createCommonTemplate();
        $user = User::factory()->create();
        $account = $this->createAccountFor($user);

        $this->actingAs($user)->post(route('templates.generate', ['template' => $template->id]), [
            'values' => ['headline' => 'Hello World'],
            'generated_image' => UploadedFile::fake()->image('generated.png', 200, 200),
        ]);
        $generated = session('generated');

        $this->actingAs($user)
            ->post(route('templates.generations.post', ['template' => $template->id, 'generation' => $generated->id]), [
                'account_ids' => [$account->id],
                'is_scheduled' => true,
                'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
            ])
            ->assertRedirect(route('posts.index'));

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'template_id' => $template->id,
            'template_generation_id' => $generated->id,
            'is_scheduled' => true,
            'is_published' => false,
            'post_id' => null,
        ]);
    }

    public function test_a_user_cannot_post_from_another_users_generation(): void
    {
        $template = $this->createCommonTemplate();
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $account = $this->createAccountFor($intruder);

        $this->actingAs($owner)->post(route('templates.generate', ['template' => $template->id]), [
            'values' => ['headline' => 'Hello World'],
            'generated_image' => UploadedFile::fake()->image('generated.png', 200, 200),
        ]);
        $generated = session('generated');

        $this->actingAs($intruder)
            ->post(route('templates.generations.post', ['template' => $template->id, 'generation' => $generated->id]), [
                'account_ids' => [$account->id],
                'is_scheduled' => false,
            ])
            ->assertForbidden();
    }

    public function test_admin_can_assign_a_private_template_and_only_the_assigned_user_sees_it(): void
    {
        $admin = $this->createAdmin();
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.templates.store'), [
                'name' => 'Assigned Template',
                'aspect_ratio' => '1:1',
                'width' => 200,
                'height' => 200,
                'config' => json_encode($this->templateConfig()),
                'is_common' => false,
                'owner_id' => $userA->id,
            ])
            ->assertRedirect();

        $template = Template::query()->where('name', 'Assigned Template')->firstOrFail();
        $this->assertSame($userA->id, $template->owner_id);
        $this->assertSame($admin->id, $template->created_by);

        $this->actingAs($userA)->get(route('templates.edit', ['template' => $template->id]))->assertOk();
        $this->actingAs($userB)->get(route('templates.edit', ['template' => $template->id]))->assertForbidden();
    }

    public function test_a_non_admin_cannot_access_admin_template_routes(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('admin.templates.index'))->assertForbidden();
        $this->actingAs($user)->get(route('admin.templates.create'))->assertForbidden();
    }

    private function templateConfig(): array
    {
        return [
            'background' => ['type' => 'color', 'value' => '#ffffff', 'editable' => false],
            'fields' => [
                [
                    'key' => 'headline',
                    'type' => 'text',
                    'label' => 'Headline',
                    'default' => 'Default Headline',
                    'editable' => true,
                    'style' => [
                        'top' => 10,
                        'left' => 10,
                        'width' => 180,
                        'fontSize' => 20,
                        'color' => '#000000',
                        'textAlign' => 'left',
                    ],
                ],
                [
                    'key' => 'locked_text',
                    'type' => 'text',
                    'label' => 'Locked',
                    'default' => 'Do not change me',
                    'editable' => false,
                    'style' => [
                        'top' => 60,
                        'left' => 10,
                        'width' => 180,
                        'fontSize' => 14,
                    ],
                ],
            ],
        ];
    }

    private function createCommonTemplate(): Template
    {
        return Template::create([
            'name' => 'Common Template',
            'aspect_ratio' => '1:1',
            'width' => 200,
            'height' => 200,
            'config' => $this->templateConfig(),
            'is_common' => true,
            'is_active' => true,
        ]);
    }

    private function createPrivateTemplate(User $owner): Template
    {
        return Template::create([
            'name' => 'Private Template',
            'aspect_ratio' => '1:1',
            'width' => 200,
            'height' => 200,
            'config' => $this->templateConfig(),
            'is_common' => false,
            'is_active' => true,
            'owner_id' => $owner->id,
        ]);
    }

    private function createAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin->refresh();
    }

    private function createAccountFor(User $user): FacebookAppAccount
    {
        $app = FacebookApp::create([
            'user_id' => $user->id,
            'app_name' => 'Test App',
            'app_id' => 'app-'.uniqid(),
            'app_secret' => 'secret',
            'app_token' => 'token',
            'status' => true,
        ]);

        return FacebookAppAccount::create([
            'facebook_app_id' => $app->id,
            'user_id' => $user->id,
            'account_id' => 'page-'.uniqid(),
            'account_name' => 'Test Page',
            'access_token' => 'page-token',
        ]);
    }
}
