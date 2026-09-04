<?php

namespace Tests\Feature;

use App\Models\Template;
use App\Services\TemplateRenderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Directly exercises TemplateRenderService::build()'s config → CSS mapping. No Browsershot
 * involved, so unlike TemplateImageGenerationTest's generation tests, these always run regardless
 * of whether BROWSERSHOT_CHROME_PATH is configured.
 */
class TemplateRenderServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Regression test for a real bug: a field relying on `parent_style.zIndex` to stay above a
     * later, larger sibling field was silently dropped server-side (while working fine in the
     * browser preview, which spreads style properties unrestricted) — the later field then
     * painted over and completely hid it. See report-image-generate.txt.
     */
    public function test_zindex_margin_and_box_shadow_are_resolved_on_both_style_and_parent_style(): void
    {
        $template = Template::create([
            'name' => 'Style Resolution Test',
            'aspect_ratio' => '1:1',
            'width' => 200,
            'height' => 200,
            'config' => [
                'background' => ['type' => 'color', 'value' => '#ffffff', 'editable' => false],
                'fields' => [
                    [
                        'key' => 'field_a',
                        'type' => 'text',
                        'label' => 'Field A',
                        'default' => 'Hello',
                        'editable' => true,
                        'style' => [
                            'top' => 10,
                            'left' => 10,
                            'width' => 100,
                            'zIndex' => 5,
                            'marginTop' => 20,
                            'boxShadow' => '0px 4px 8px rgba(0,0,0,0.3)',
                        ],
                        'parent_style' => [
                            'top' => 0,
                            'left' => 0,
                            'width' => 200,
                            'height' => 200,
                            'zIndex' => 2,
                            'marginLeft' => '5px',
                        ],
                    ],
                ],
            ],
            'is_common' => true,
            'is_active' => true,
        ]);

        $model = app(TemplateRenderService::class)->build($template, []);
        $field = $model['fields'][0];

        $this->assertStringContainsString('z-index: 5', $field['css']);
        $this->assertStringContainsString('margin-top: 20px', $field['css']);
        $this->assertStringContainsString('box-shadow: 0px 4px 8px rgba(0,0,0,0.3)', $field['css']);

        $this->assertStringContainsString('z-index: 2', $field['parentCss']);
        $this->assertStringContainsString('margin-left: 5px', $field['parentCss']);
    }
}
