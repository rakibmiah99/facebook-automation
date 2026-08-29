<?php

namespace App\Services;

use App\Helpers\UtilsHelper;
use App\Models\Template;
use App\Repositories\MediaHelperRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;
use Intervention\Image\Typography\Font;
use Throwable;

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
        $source = $this->resolveImageSource($background['path'] ?? null, $editable ? $override : null);

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
     * same CSS property names (top, left, right, bottom, width, height, ...) the browser
     * preview renders with — see resources/js/modules/templates/components/TemplatePreview.tsx.
     * `resolveBox()` reproduces the CSS absolute-positioning math the browser does for free
     * (percentages, `right`/`bottom` anchors, shrink-to-fit sizing); `textAlign`/`justifyContent`/
     * `alignItems` are resolved into a GD anchor point + Intervention's own alignment mode rather
     * than relying on manual pixel math for every case.
     *
     * @param  array<string, mixed>  $style
     */
    private function applyTextField(ImageInterface $canvas, array $style, string $text): void
    {
        $canvasWidth = $canvas->width();
        $canvasHeight = $canvas->height();
        $padding = (int) $this->resolveLength($style['padding'] ?? null, null);

        [$left, $top, $width, $height] = $this->resolveBox(
            $style,
            $canvasWidth,
            $canvasHeight,
            fn () => $this->measureShrinkWrapSize($canvas, $style, $text, $padding),
        );

        $this->drawBox($canvas, $style, $left, $top, $width, $height);

        $isFlex = ($style['display'] ?? null) === 'flex';
        $horizontalAlign = $isFlex
            ? ($this->mapFlexAlign($style['justifyContent'] ?? null, 'left', 'right') ?? $this->resolveTextAlign($style))
            : $this->resolveTextAlign($style);
        $verticalAlign = $isFlex
            ? ($this->mapFlexAlign($style['alignItems'] ?? null, 'top', 'bottom') ?? 'top')
            : 'top';

        $innerWidth = max(1, $width - 2 * $padding);
        $innerHeight = max(1, $height - 2 * $padding);

        $anchorX = match ($horizontalAlign) {
            'center' => $left + $padding + intdiv($innerWidth, 2),
            'right' => $left + $width - $padding,
            default => $left + $padding,
        };

        $anchorY = match ($verticalAlign) {
            'center' => $top + $padding + intdiv($innerHeight, 2),
            'bottom' => $top + $height - $padding,
            default => $top + $padding,
        };

        $canvas->text($text, $anchorX, $anchorY, function ($font) use ($style, $horizontalAlign, $verticalAlign, $innerWidth) {
            $font->size((float) $this->resolveLength($style['fontSize'] ?? null, null, 32));
            $font->color($style['color'] ?? '#000000');
            $font->align($horizontalAlign, $verticalAlign);
            $font->filename($this->resolveFontPath($style));
            $font->wrap($innerWidth);

            if (! empty($style['lineHeight'])) {
                $font->lineHeight((float) $style['lineHeight']);
            }
        });
    }

    /**
     * Sanitizes `style.textAlign` to one of the three modes Intervention's font alignment
     * understands, defaulting to "left" exactly like an unset CSS `text-align` would.
     *
     * @param  array<string, mixed>  $style
     */
    private function resolveTextAlign(array $style): string
    {
        $requested = $style['textAlign'] ?? 'left';

        return in_array($requested, ['left', 'center', 'right'], true) ? $requested : 'left';
    }

    /**
     * Maps a CSS flexbox `justifyContent`/`alignItems` value onto the axis-appropriate
     * left/center/right or top/center/bottom vocabulary Intervention's font alignment uses.
     * `$start`/`$end` tell it which axis is being mapped ("left"/"right" for `justifyContent`,
     * "top"/"bottom" for `alignItems`) since "flex-start"/"flex-end" are axis-agnostic in CSS.
     * Returns null for an unset/unrecognized value so the caller can fall back to its own default.
     */
    private function mapFlexAlign(mixed $value, string $start, string $end): ?string
    {
        return match ($value) {
            'flex-start', 'start', $start => $start,
            'center' => 'center',
            'flex-end', 'end', $end => $end,
            default => null,
        };
    }

    /**
     * Parses a CSS-style length: a plain number, a "*px" string (PHP's numeric-string casting
     * already strips the unit), or a "*%" string resolved against `$percentBase` — the same three
     * forms the guideline's example configs and the browser preview both accept, since the preview
     * just spreads these straight onto a real CSS `style` object.
     */
    private function resolveLength(mixed $value, ?float $percentBase, float $default = 0.0): float
    {
        if ($value === null || $value === '') {
            return $default;
        }

        if (is_string($value) && str_ends_with(trim($value), '%')) {
            $percent = (float) rtrim(trim($value), '%');

            return $percentBase !== null ? ($percent / 100) * $percentBase : $default;
        }

        return (float) $value;
    }

    /**
     * Resolves a field's box geometry the way the browser preview's CSS would: `top`/`left`/
     * `right`/`bottom` all participate in absolute positioning, percentages resolve against the
     * canvas, and if neither an explicit size nor an opposing edge pair (left+right / top+bottom)
     * pins a dimension down, `$measureContent` (when given) supplies an intrinsic "auto" size —
     * mirroring a browser sizing an unconstrained absolutely-positioned element to its content.
     *
     * @param  array<string, mixed>  $style
     * @param  (callable(): array{0: float, 1: float})|null  $measureContent
     * @return array{0: int, 1: int, 2: int, 3: int} [left, top, width, height]
     */
    private function resolveBox(array $style, int $canvasWidth, int $canvasHeight, ?callable $measureContent = null): array
    {
        $hasLeft = isset($style['left']);
        $hasRight = isset($style['right']);
        $hasTop = isset($style['top']);
        $hasBottom = isset($style['bottom']);

        $left = $this->resolveLength($style['left'] ?? null, (float) $canvasWidth);
        $right = $this->resolveLength($style['right'] ?? null, (float) $canvasWidth);
        $top = $this->resolveLength($style['top'] ?? null, (float) $canvasHeight);
        $bottom = $this->resolveLength($style['bottom'] ?? null, (float) $canvasHeight);

        $width = isset($style['width']) ? $this->resolveLength($style['width'], (float) $canvasWidth) : null;
        $height = isset($style['height']) ? $this->resolveLength($style['height'], (float) $canvasHeight) : null;

        $measured = ($width === null || $height === null) && $measureContent ? $measureContent() : null;

        if ($width === null) {
            $width = match (true) {
                $hasLeft && $hasRight => max(0.0, $canvasWidth - $left - $right),
                $measured !== null => $measured[0],
                default => (float) $canvasWidth,
            };
        }

        if ($height === null) {
            $height = match (true) {
                $hasTop && $hasBottom => max(0.0, $canvasHeight - $top - $bottom),
                $measured !== null => $measured[1],
                default => 0.0,
            };
        }

        $x = $hasLeft ? $left : ($hasRight ? $canvasWidth - $right - $width : 0.0);
        $y = $hasTop ? $top : ($hasBottom ? $canvasHeight - $bottom - $height : 0.0);

        return [(int) round($x), (int) round($y), (int) round($width), (int) round($height)];
    }

    /**
     * Measures a single line of text at the field's font/size, plus padding on all sides — the
     * "auto" content-box size a browser would give an absolutely-positioned element with no
     * explicit width/height (e.g. a corner watermark anchored only by `right`/`bottom`).
     *
     * @param  array<string, mixed>  $style
     * @return array{0: float, 1: float}
     */
    private function measureShrinkWrapSize(ImageInterface $canvas, array $style, string $text, int $padding): array
    {
        $font = new Font(
            filepath: $this->resolveFontPath($style),
            size: (float) $this->resolveLength($style['fontSize'] ?? null, null, 32),
        );

        $size = $canvas->driver()->fontProcessor()->boxSize($text, $font);

        return [$size->width() + 2 * $padding, $size->height() + 2 * $padding];
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
     * Draws the field's box background/border, if the style asks for any of them — mirrors the CSS
     * `background-color`/`background-image`/`border` the browser preview applies to the same box.
     * Layered bottom-to-top exactly like CSS: color fill, then background image cover-fit on top of
     * it, then the border on top of both — so drawn as three separate passes rather than one
     * `drawRectangle` call (which can't sandwich an image between a fill and a border).
     *
     * @param  array<string, mixed>  $style
     */
    private function drawBox(ImageInterface $canvas, array $style, int $x, int $y, int $width, int $height): void
    {
        $backgroundColor = $style['backgroundColor'] ?? null;
        $backgroundImagePath = UtilsHelper::ExtractCssUrl($style['backgroundImage'] ?? null);
        $borderColor = $style['borderColor'] ?? null;
        $borderWidth = (int) ($style['borderWidth'] ?? 0);

        if ($width <= 0 || $height <= 0) {
            return;
        }

        if ($backgroundColor) {
            $canvas->drawRectangle(function ($rectangle) use ($x, $y, $width, $height, $backgroundColor) {
                $rectangle->size($width, $height);
                $rectangle->at($x, $y);
                $rectangle->background($backgroundColor);
            });
        }

        if ($backgroundImagePath) {
            $image = $this->resolveImageSource($backgroundImagePath, null);

            if ($image) {
                $image->cover($width, $height);
                $canvas->insert($image, $x, $y);
            }
        }

        if ($borderColor && $borderWidth > 0) {
            $canvas->drawRectangle(function ($rectangle) use ($x, $y, $width, $height, $borderColor, $borderWidth) {
                $rectangle->size($width, $height);
                $rectangle->at($x, $y);
                $rectangle->border($borderColor, $borderWidth);
            });
        }
    }

    /**
     * Resolves a field/background image to a decoded Intervention image, in priority order: an
     * end-user-uploaded override, then a fully-qualified URL (fetched over HTTP — templates can
     * point `default`/`path`/`backgroundImage` at an external image instead of a storage path),
     * then a relative path on the app's media disk. Returns null (never throws) if nothing usable
     * is found, so a bad/unreachable path just quietly omits that one image the same way a
     * missing path already does.
     */
    private function resolveImageSource(?string $path, ?UploadedFile $override): ?ImageInterface
    {
        if ($override) {
            return $this->manager->decodePath($override->getPathname());
        }

        if (! $path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            try {
                $response = Http::timeout(10)->get($path);

                return $response->successful()
                    ? $this->manager->decodeBinary($response->body())
                    : null;
            } catch (Throwable) {
                return null;
            }
        }

        if (Storage::disk($this->mediaDisk())->exists($path)) {
            return $this->manager->decodeBinary(Storage::disk($this->mediaDisk())->get($path));
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $style
     */
    private function applyImageField(ImageInterface $canvas, array $style, ?string $defaultPath, ?UploadedFile $override): void
    {
        [$left, $top, $width, $height] = $this->resolveBox($style, $canvas->width(), $canvas->height());
        $padding = (int) $this->resolveLength($style['padding'] ?? null, null);

        if ($width <= 0 || $height <= 0) {
            return;
        }

        $this->drawBox($canvas, $style, $left, $top, $width, $height);

        $source = $this->resolveImageSource($defaultPath, $override);

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
