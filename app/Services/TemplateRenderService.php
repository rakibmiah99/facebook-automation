<?php

namespace App\Services;

use App\Helpers\UtilsHelper;
use App\Models\Template;
use App\Repositories\MediaHelperRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;

/**
 * Renders a Template's config (background + positioned text/image fields) into a final
 * image using Intervention Image (already a project dependency, see MediaHelper), then
 * stores it through the existing Media Helper so generated images share the same
 * storage/CDN pipeline as every other upload in the app.
 */
class TemplateRenderService
{
    private ImageManager $manager;

    public function __construct(
        private MediaHelperRepositoryInterface $mediaHelper,
    ) {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * @param  array<string, string>  $values  Text overrides keyed by editable field key.
     * @param  array<string, UploadedFile>  $images  Image overrides keyed by editable field key ('background' targets the template background).
     * @return string Relative storage path of the generated image (through MediaHelperRepositoryInterface).
     */
    public function render(Template $template, array $values, array $images): string
    {
        $config = $template->config ?? [];
        $canvas = $this->manager->createImage($template->width, $template->height);
        $canvas->fill('#ffffff');

        $this->applyBackground($canvas, $config['background'] ?? null, $images['background'] ?? null);

        foreach ($config['fields'] ?? [] as $field) {
            $this->applyField($canvas, $field, $values, $images);
        }

        return $this->store($canvas);
    }

    private function applyBackground(ImageInterface $canvas, ?array $background, ?UploadedFile $override): void
    {
        if (! $background) {
            return;
        }

        $editable = (bool) ($background['editable'] ?? false);
        $type = $background['type'] ?? 'color';

        if ($type === 'color') {
            $color = $editable && ! empty($background['value_override'])
                ? $background['value_override']
                : ($background['value'] ?? '#ffffff');

            $canvas->fill($color);

            return;
        }

        // type === 'image'
        $source = null;

        if ($editable && $override) {
            $source = $this->manager->decodePath($override->getPathname());
        } elseif (! empty($background['path']) && Storage::disk($this->mediaDisk())->exists($background['path'])) {
            $source = $this->manager->decodeBinary(Storage::disk($this->mediaDisk())->get($background['path']));
        }

        if (! $source) {
            return;
        }

        $source->cover($canvas->width(), $canvas->height());
        $canvas->insert($source, 0, 0);
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  array<string, string>  $values
     * @param  array<string, UploadedFile>  $images
     */
    private function applyField(ImageInterface $canvas, array $field, array $values, array $images): void
    {
        $key = $field['key'] ?? null;
        $type = $field['type'] ?? 'text';
        $editable = (bool) ($field['editable'] ?? false);
        $style = $field['style'] ?? [];

        if (! $key) {
            return;
        }

        if ($type === 'image') {
            $this->applyImageField(
                $canvas,
                $style,
                $field['default'] ?? null,
                $editable && array_key_exists($key, $images) ? $images[$key] : null,
            );

            return;
        }

        $text = $editable && array_key_exists($key, $values)
            ? $values[$key]
            : ($field['default'] ?? '');

        if ($text === '' || $text === null) {
            return;
        }

        $this->applyTextField($canvas, $style, (string) $text);
    }

    /**
     * Every position/size is read straight off the field's `style` object, which uses the
     * same CSS property names (top, left, width, height, ...) the browser preview renders
     * with — see resources/js/modules/templates/components/TemplatePreview.tsx. `top`/`left`
     * are always the box's top-left corner (plain CSS `position: absolute` semantics), so
     * `textAlign` is resolved into a GD anchor point ourselves rather than relying on GD's
     * own anchor-based alignment.
     *
     * @param  array<string, mixed>  $style
     */
    private function applyTextField(ImageInterface $canvas, array $style, string $text): void
    {
        $left = (int) ($style['left'] ?? 0);
        $top = (int) ($style['top'] ?? 0);
        $width = (int) ($style['width'] ?? 0);
        $height = (int) ($style['height'] ?? 0);
        $padding = (int) ($style['padding'] ?? 0);
        $align = in_array($style['textAlign'] ?? 'left', ['left', 'center', 'right'], true)
            ? $style['textAlign']
            : 'left';

        $this->drawBox($canvas, $style, $left, $top, $width, $height);

        $innerWidth = max(1, $width - 2 * $padding);
        $anchorX = match ($align) {
            'center' => $left + $padding + intdiv($innerWidth, 2),
            'right' => $left + $width - $padding,
            default => $left + $padding,
        };

        $canvas->text($text, $anchorX, $top + $padding, function ($font) use ($style, $align, $innerWidth) {
            $font->size((float) ($style['fontSize'] ?? 32));
            $font->color($style['color'] ?? '#000000');
            $font->align($align, 'top');
            $font->filename($this->resolveFontPath($style));
            $font->wrap($innerWidth);

            if (! empty($style['lineHeight'])) {
                $font->lineHeight((float) $style['lineHeight']);
            }
        });
    }

    /**
     * Always draw with a real TTF file so GD uses scalable, properly-sized text
     * (imagettftext) instead of silently falling back to its tiny fixed-size bitmap
     * font when no font is set — which is what made generated images look nothing
     * like the live preview. Bundled Inter matches the font the editor's live
     * preview already renders with (see resources/css/app.css --font-body).
     *
     * @param  array<string, mixed>  $style
     */
    private function resolveFontPath(array $style): string
    {
        $customPath = $style['fontPath'] ?? null;

        if ($customPath && is_file($customPath)) {
            return $customPath;
        }

        return resource_path('fonts/Inter-Variable.ttf');
    }

    /**
     * Draws the field's box background/border, if the style asks for either — mirrors the CSS
     * `background-color`/`border` the browser preview applies to the same box.
     *
     * @param  array<string, mixed>  $style
     */
    private function drawBox(ImageInterface $canvas, array $style, int $x, int $y, int $width, int $height): void
    {
        $backgroundColor = $style['backgroundColor'] ?? null;
        $borderColor = $style['borderColor'] ?? null;
        $borderWidth = (int) ($style['borderWidth'] ?? 0);

        if ($width <= 0 || $height <= 0) {
            return;
        }

        if (! $backgroundColor && ! ($borderColor && $borderWidth > 0)) {
            return;
        }

        $canvas->drawRectangle(function ($rectangle) use ($x, $y, $width, $height, $backgroundColor, $borderColor, $borderWidth) {
            $rectangle->size($width, $height);
            $rectangle->at($x, $y);

            if ($backgroundColor) {
                $rectangle->background($backgroundColor);
            }

            if ($borderColor && $borderWidth > 0) {
                $rectangle->border($borderColor, $borderWidth);
            }
        });
    }

    /**
     * @param  array<string, mixed>  $style
     */
    private function applyImageField(ImageInterface $canvas, array $style, ?string $defaultPath, ?UploadedFile $override): void
    {
        $left = (int) ($style['left'] ?? 0);
        $top = (int) ($style['top'] ?? 0);
        $width = (int) ($style['width'] ?? 0);
        $height = (int) ($style['height'] ?? 0);
        $padding = (int) ($style['padding'] ?? 0);

        if ($width <= 0 || $height <= 0) {
            return;
        }

        $this->drawBox($canvas, $style, $left, $top, $width, $height);

        $source = null;

        if ($override) {
            $source = $this->manager->decodePath($override->getPathname());
        } elseif ($defaultPath && Storage::disk($this->mediaDisk())->exists($defaultPath)) {
            $source = $this->manager->decodeBinary(Storage::disk($this->mediaDisk())->get($defaultPath));
        }

        if (! $source) {
            return;
        }

        $innerWidth = max(1, $width - 2 * $padding);
        $innerHeight = max(1, $height - 2 * $padding);

        if (($style['objectFit'] ?? 'cover') === 'contain') {
            $source->contain($innerWidth, $innerHeight);
        } else {
            $source->cover($innerWidth, $innerHeight);
        }

        $canvas->insert($source, $left + $padding, $top + $padding);
    }

    private function store(ImageInterface $canvas): string
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'template-render-').'.webp';
        file_put_contents($tempPath, $canvas->encode(new WebpEncoder(quality: 95))->toString());

        $uploadedFile = new UploadedFile($tempPath, 'generated.webp', 'image/webp', null, true);

        $storedPath = $this->mediaHelper->upload($uploadedFile, UtilsHelper::MonthYearWisePath('templates'));

        @unlink($tempPath);

        return $storedPath;
    }

    private function mediaDisk(): string
    {
        return config('filesystems.default');
    }
}
