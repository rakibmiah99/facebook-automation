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

        if (! $key) {
            return;
        }

        if ($type === 'image') {
            $this->applyImageField($canvas, $field, $editable && array_key_exists($key, $images) ? $images[$key] : null);

            return;
        }

        $text = $editable && array_key_exists($key, $values)
            ? $values[$key]
            : ($field['default'] ?? '');

        if ($text === '' || $text === null) {
            return;
        }

        $x = (int) ($field['x'] ?? 0);
        $y = (int) ($field['y'] ?? 0);

        $canvas->text((string) $text, $x, $y, function ($font) use ($field) {
            $font->size((float) ($field['font_size'] ?? 32));
            $font->color($field['color'] ?? '#000000');
            $font->align($field['align'] ?? 'left', $this->resolveValign($field['valign'] ?? 'top'));
            $font->filename($this->resolveFontPath($field));

            if (! empty($field['width'])) {
                $font->wrap((int) $field['width']);
            }

            if (! empty($field['line_height'])) {
                $font->lineHeight((float) $field['line_height']);
            }
        });
    }

    /**
     * Always draw with a real TTF file so GD uses scalable, properly-sized text
     * (imagettftext) instead of silently falling back to its tiny fixed-size bitmap
     * font when no font is set — which is what made generated images look nothing
     * like the live preview. Bundled Inter matches the font the editor's live
     * preview already renders with (see resources/css/app.css --font-body).
     */
    private function resolveFontPath(array $field): string
    {
        $customPath = $field['font_path'] ?? null;

        if ($customPath && is_file($customPath)) {
            return $customPath;
        }

        return resource_path('fonts/Inter-Variable.ttf');
    }

    /**
     * The editor's valign option is 'middle' (matching the CSS vertical-align vocabulary
     * template authors expect), but Intervention Image's Alignment enum only recognizes
     * 'center' for that axis — passing 'middle' straight through throws.
     */
    private function resolveValign(string $valign): string
    {
        return $valign === 'middle' ? 'center' : $valign;
    }

    private function applyImageField(ImageInterface $canvas, array $field, ?UploadedFile $override): void
    {
        $width = (int) ($field['width'] ?? 0);
        $height = (int) ($field['height'] ?? 0);

        if ($width <= 0 || $height <= 0) {
            return;
        }

        $source = null;

        if ($override) {
            $source = $this->manager->decodePath($override->getPathname());
        } elseif (! empty($field['default']) && Storage::disk($this->mediaDisk())->exists($field['default'])) {
            $source = $this->manager->decodeBinary(Storage::disk($this->mediaDisk())->get($field['default']));
        }

        if (! $source) {
            return;
        }

        $source->cover($width, $height);
        $canvas->insert($source, (int) ($field['x'] ?? 0), (int) ($field['y'] ?? 0));
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
