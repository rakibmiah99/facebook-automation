<?php

namespace App\Helpers;

use App\Repositories\MediaHelperRepositoryInterface;
use Illuminate\Support\Str;

class UtilsHelper
{
    public static function MonthYearWisePath(string $prefix = 'uploads'): string
    {
        return trim($prefix, '/').'/'.now()->format('Y/m');
    }

    static public function GetMediaUrl(?string $path, ?string $disk = null): ?string
    {
        if (! $path) return null;

        // Already a fully-qualified URL (e.g. a template field's default/background pasted as an
        // external link rather than a storage path) — prefixing it with the disk's base URL would
        // produce a broken, double-prefixed link, so pass it through untouched.
        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        $mediaHelperRepository = app(MediaHelperRepositoryInterface::class);
        return $mediaHelperRepository->url($path, $disk);
    }

    /**
     * Pulls the path/URL out of a CSS `url('...')` value, e.g. a template field's
     * `style.backgroundImage` — shared by the server-side renderer (TemplateRenderService, which
     * needs the raw path/URL to fetch the image) and Template::resolveConfigUrls() (which needs it
     * to rewrite the style into a real media URL the browser preview can load).
     */
    public static function ExtractCssUrl(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        if (preg_match('/^url\((["\']?)(.*)\1\)$/', trim($value), $matches)) {
            return $matches[2] !== '' ? $matches[2] : null;
        }

        return null;
    }
}
