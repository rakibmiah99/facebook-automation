<?php

namespace App\Helpers;

use App\Repositories\MediaHelperRepositoryInterface;

class UtilsHelper
{
    public static function MonthYearWisePath(string $prefix = 'uploads'): string
    {
        return trim($prefix, '/').'/'.now()->format('Y/m');
    }

    static public function GetMediaUrl(?string $path, ?string $disk = null): ?string
    {
        $mediaHelperRepository = app(MediaHelperRepositoryInterface::class);
        if (! $path) return null;
        return $mediaHelperRepository->url($path, $disk);
    }
}
