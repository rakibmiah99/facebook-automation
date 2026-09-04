<?php

namespace Tests\Feature;

use App\Models\FacebookApp;
use App\Models\FacebookAppAccount;
use App\Models\Template;
use App\Models\TemplateGeneration;
use App\Models\User;
use App\Repositories\FacebookRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Fakes\FakeFacebookRepository;
use Tests\TestCase;

/**
 * Exercises the token-authenticated (Sanctum), Browsershot-based generation API
 * (TemplateImageController / TemplateImageGenerationService, routes/api.php) — separate from the
 * client-upload path already covered by TemplateTest. Generation tests spin up a real headless
 * Chromium via Browsershot, so they're skipped wherever BROWSERSHOT_CHROME_PATH isn't configured
 * (e.g. CI without Chrome installed); the list/show endpoints don't need Chrome and always run.
 */
class TemplateImageGenerationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('r2');
        $this->app->bind(FacebookRepositoryInterface::class, FakeFacebookRepository::class);
    }

    public function test_the_generate_endpoint_requires_a_token(): void
    {
        $template = $this->createCommonTemplate();

        $this->postJson(route('api.templates.generate-image', ['template' => $template->id]))
            ->assertUnauthorized();
    }

    public function test_template_index_lists_common_and_own_templates_only(): void
    {
        $user = User::factory()->create();
        $stranger = User::factory()->create();

        $this->createCommonTemplate();
        $this->createPrivateTemplate($user);
        $this->createPrivateTemplate($stranger);

        Sanctum::actingAs($user);

        $this->getJson(route('api.templates.index'))
            ->assertOk()
            ->assertJson(['status' => true])
            ->assertJsonCount(2, 'data');
    }

    public function test_template_show_returns_fields_and_a_values_example(): void
    {
        $template = $this->createCommonTemplate();
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this->getJson(route('api.templates.show', ['template' => $template->id]))
            ->assertOk()
            ->assertJson([
                'status' => true,
                'data' => [
                    'template_id' => $template->id,
                    'width' => 200,
                    'height' => 200,
                    'values_example' => ['headline' => 'Default Headline'],
                ],
            ]);
    }

    public function test_values_example_includes_every_editable_field_text_or_image(): void
    {
        $template = Template::create([
            'name' => 'Mixed Editability',
            'aspect_ratio' => '1:1',
            'width' => 200,
            'height' => 200,
            'config' => [
                'background' => ['type' => 'color', 'value' => '#ffffff', 'editable' => false],
                'fields' => [
                    [
                        'key' => 'headline',
                        'type' => 'text',
                        'label' => 'Headline',
                        'default' => 'Editable Default',
                        'editable' => true,
                        'style' => ['top' => 10, 'left' => 10, 'width' => 180, 'fontSize' => 20],
                    ],
                    [
                        'key' => 'watermark',
                        'type' => 'text',
                        'label' => 'Watermark',
                        'default' => 'Fixed Text',
                        'editable' => false,
                        'style' => ['bottom' => 10, 'right' => 10, 'width' => 180, 'fontSize' => 12],
                    ],
                    [
                        'key' => 'logo',
                        'type' => 'image',
                        'label' => 'Logo',
                        'default' => 'https://example.com/logo.png',
                        'editable' => true,
                        'style' => ['top' => 0, 'left' => 0, 'width' => 50, 'height' => 50],
                    ],
                    [
                        'key' => 'fixed_icon',
                        'type' => 'image',
                        'label' => 'Fixed Icon',
                        'default' => 'https://example.com/icon.png',
                        'editable' => false,
                        'style' => ['bottom' => 0, 'right' => 0, 'width' => 50, 'height' => 50],
                    ],
                ],
            ],
            'is_common' => true,
            'is_active' => true,
        ]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson(route('api.templates.show', ['template' => $template->id]))
            ->assertOk()
            ->assertJson([
                'status' => true,
                'data' => [
                    'values_example' => [
                        'headline' => 'Editable Default',
                        'logo' => 'https://example.com/logo.png',
                    ],
                ],
            ])
            ->assertJsonMissingPath('data.values_example.watermark')
            ->assertJsonMissingPath('data.values_example.fixed_icon');
    }

    public function test_an_image_field_value_override_rejects_a_non_http_url(): void
    {
        $template = $this->createTemplateWithImageField();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson(route('api.templates.generate-image', ['template' => $template->id]), [
            'values' => ['logo' => 'file:///etc/passwd'],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['values.logo']);
    }

    public function test_an_image_field_value_override_is_used_when_generating(): void
    {
        $this->skipIfChromeUnavailable();

        $template = $this->createTemplateWithImageField();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson(route('api.templates.generate-image', ['template' => $template->id]), [
            'values' => ['logo' => 'https://example.com/custom-logo.png'],
        ])->assertOk();

        $generation = TemplateGeneration::find($response->json('data.generation_id'));
        $this->assertSame('https://example.com/custom-logo.png', $generation->values['logo'] ?? null);
    }

    public function test_show_is_forbidden_for_another_users_private_template(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $template = $this->createPrivateTemplate($owner);

        Sanctum::actingAs($intruder);

        $this->getJson(route('api.templates.show', ['template' => $template->id]))
            ->assertForbidden();
    }

    public function test_valid_template_generates_an_image_and_returns_the_expected_json(): void
    {
        $this->skipIfChromeUnavailable();

        $template = $this->createCommonTemplate();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson(route('api.templates.generate-image', ['template' => $template->id]))
            ->assertOk()
            ->assertJson(['status' => true])
            ->assertJsonStructure(['status', 'message', 'data' => ['url', 'path', 'template_id', 'generation_id']]);

        $path = $response->json('data.path');
        Storage::disk('r2')->assertExists($path);

        $this->assertDatabaseHas('template_generations', [
            'id' => $response->json('data.generation_id'),
            'template_id' => $template->id,
            'user_id' => $user->id,
            'path' => $path,
        ]);
    }

    public function test_values_override_is_persisted_on_the_generation(): void
    {
        $this->skipIfChromeUnavailable();

        $template = $this->createCommonTemplate();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson(route('api.templates.generate-image', ['template' => $template->id]), [
            'values' => ['headline' => 'Overridden Headline'],
        ])->assertOk();

        $generation = TemplateGeneration::find($response->json('data.generation_id'));
        $this->assertSame('Overridden Headline', $generation->values['headline'] ?? null);
    }

    public function test_flat_top_level_body_is_accepted_as_values(): void
    {
        $this->skipIfChromeUnavailable();

        $template = $this->createCommonTemplate();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // No `values` wrapper — just the field key straight at the top level, e.g. what a
        // caller building the body directly from `values_example` naturally sends.
        $response = $this->postJson(route('api.templates.generate-image', ['template' => $template->id]), [
            'headline' => 'Flat Body Headline',
        ])->assertOk();

        $generation = TemplateGeneration::find($response->json('data.generation_id'));
        $this->assertSame('Flat Body Headline', $generation->values['headline'] ?? null);
    }

    public function test_user_cannot_generate_an_image_for_another_users_private_template(): void
    {
        $this->skipIfChromeUnavailable();

        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $template = $this->createPrivateTemplate($owner);
        Sanctum::actingAs($intruder);

        $this->postJson(route('api.templates.generate-image', ['template' => $template->id]))
            ->assertForbidden();
    }

    public function test_invalid_values_payload_fails_validation(): void
    {
        $this->skipIfChromeUnavailable();

        $template = $this->createCommonTemplate();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson(route('api.templates.generate-image', ['template' => $template->id]), [
            'values' => ['headline' => str_repeat('x', 2001)],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['values.headline']);
    }

    public function test_a_template_with_no_fields_still_generates_a_background_only_image(): void
    {
        $this->skipIfChromeUnavailable();

        $template = Template::create([
            'name' => 'Background Only',
            'aspect_ratio' => '1:1',
            'width' => 200,
            'height' => 200,
            'config' => [
                'background' => ['type' => 'color', 'value' => '#ff0000', 'editable' => false],
                'fields' => [],
            ],
            'is_common' => true,
            'is_active' => true,
        ]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson(route('api.templates.generate-image', ['template' => $template->id]))
            ->assertOk()
            ->assertJson(['status' => true]);
    }

    public function test_a_field_with_parent_style_generates_successfully(): void
    {
        $this->skipIfChromeUnavailable();

        $template = Template::create([
            'name' => 'Parent Style',
            'aspect_ratio' => '1:1',
            'width' => 200,
            'height' => 200,
            'config' => [
                'background' => ['type' => 'color', 'value' => '#ffffff', 'editable' => false],
                'fields' => [
                    [
                        'key' => 'headline',
                        'type' => 'text',
                        'label' => 'Headline',
                        'default' => 'Framed',
                        'editable' => true,
                        'style' => ['top' => 0, 'left' => 0, 'width' => '100%', 'color' => '#000000', 'fontSize' => 16],
                        // borderRadius here must NOT reach the generated image — square corners
                        // only, matching `style.borderRadius`'s existing preview-only rule.
                        'parent_style' => ['top' => 20, 'left' => 20, 'width' => 160, 'height' => 60, 'backgroundColor' => '#eeeeee', 'borderRadius' => 12],
                    ],
                    [
                        'key' => 'unframed',
                        'type' => 'text',
                        'label' => 'Unframed',
                        'default' => 'No wrapper styling',
                        'editable' => true,
                        'style' => ['top' => 100, 'left' => 10, 'width' => 180, 'color' => '#000000', 'fontSize' => 12],
                    ],
                ],
            ],
            'is_common' => true,
            'is_active' => true,
        ]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson(route('api.templates.generate-image', ['template' => $template->id]))
            ->assertOk()
            ->assertJson(['status' => true]);
    }

    public function test_generate_with_a_page_id_publishes_and_returns_a_permalink(): void
    {
        $this->skipIfChromeUnavailable();

        $template = $this->createCommonTemplate();
        $user = User::factory()->create();
        $account = $this->createAccountFor($user);
        Sanctum::actingAs($user);

        $response = $this->postJson(route('api.templates.generate-image', ['template' => $template->id]), [
            'values' => ['headline' => 'Hello World'],
            'page_id' => $account->id,
            'caption' => 'Check this out',
            'comment_message' => 'First comment',
        ])
            ->assertOk()
            ->assertJson(['status' => true, 'data' => ['page_posted' => true]]);

        $this->assertNotEmpty($response->json('data.permalink'));

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'facebook_app_account_id' => $account->id,
            'template_id' => $template->id,
            'template_generation_id' => $response->json('data.generation_id'),
            'is_published' => true,
        ]);

        $this->assertDatabaseHas('post_comments', [
            'message' => 'First comment',
        ]);
    }

    public function test_generate_without_a_page_id_does_not_post_anywhere(): void
    {
        $this->skipIfChromeUnavailable();

        $template = $this->createCommonTemplate();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson(route('api.templates.generate-image', ['template' => $template->id]))
            ->assertOk()
            ->assertJson(['status' => true, 'data' => ['page_posted' => false, 'permalink' => null]]);

        $this->assertDatabaseCount('posts', 0);
    }

    public function test_a_page_id_belonging_to_another_user_is_rejected(): void
    {
        $template = $this->createCommonTemplate();
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $account = $this->createAccountFor($owner);
        Sanctum::actingAs($intruder);

        $this->postJson(route('api.templates.generate-image', ['template' => $template->id]), [
            'page_id' => $account->id,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['page_id']);
    }

    private function skipIfChromeUnavailable(): void
    {
        if (empty(config('browsershot.chrome_path'))) {
            $this->markTestSkipped('BROWSERSHOT_CHROME_PATH is not configured in this environment.');
        }
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

    private function createTemplateWithImageField(): Template
    {
        return Template::create([
            'name' => 'Has Image Field',
            'aspect_ratio' => '1:1',
            'width' => 200,
            'height' => 200,
            'config' => [
                'background' => ['type' => 'color', 'value' => '#ffffff', 'editable' => false],
                'fields' => [
                    [
                        'key' => 'logo',
                        'type' => 'image',
                        'label' => 'Logo',
                        'default' => 'https://example.com/logo.png',
                        'editable' => true,
                        'style' => ['top' => 0, 'left' => 0, 'width' => 50, 'height' => 50],
                    ],
                ],
            ],
            'is_common' => true,
            'is_active' => true,
        ]);
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
