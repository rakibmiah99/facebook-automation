<?php

namespace App\Services;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

/**
 * Fetches a remote image server-side and streams it back same-origin. Exists purely so the
 * browser's template-image capture (modern-screenshot, see templates/pages/edit.tsx) can embed
 * CDN-hosted field images (backgrounds, overlays, etc.) that don't send CORS headers — a direct
 * cross-origin fetch from the browser would be blocked and the image would render blank in the
 * generated file, even though it displays fine in a plain `<img>` tag.
 */
class MediaProxyService
{
    public function fetch(string $url): Response
    {
        $this->assertPubliclyRoutable($url);

        $response = Http::timeout(10)->get($url);

        abort_unless($response->successful(), 502, 'Failed to fetch the remote image.');

        $contentType = $response->header('Content-Type') ?: 'application/octet-stream';

        abort_unless(str_starts_with($contentType, 'image/'), 422, 'The requested URL is not an image.');

        return response($response->body(), 200)->header('Content-Type', $contentType);
    }

    /**
     * Basic SSRF guard: refuses obviously local/private hosts (localhost, loopback/LAN IP
     * literals) so this can't be used to probe the app's own internal network. Deliberately a
     * literal-host check rather than resolving DNS ourselves and inspecting the resulting IP —
     * that would just race the real request's own resolution (DNS can answer differently a
     * moment later) without actually pinning the connection to the checked address, so it adds
     * complexity without closing the gap. A template's field images are always public CDN/media
     * URLs, never internal hosts, so this is enough for that use case.
     */
    private function assertPubliclyRoutable(string $url): void
    {
        $host = parse_url($url, PHP_URL_HOST);

        abort_if(! $host, 422, 'Invalid URL.');

        $host = strtolower($host);
        $isPrivateIpLiteral = filter_var($host, FILTER_VALIDATE_IP)
            && filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;

        abort_if(
            $isPrivateIpLiteral || $host === 'localhost' || str_ends_with($host, '.localhost') || str_ends_with($host, '.local'),
            403,
            'Refusing to fetch a private/internal address.',
        );
    }
}
