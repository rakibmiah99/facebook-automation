<?php

namespace App\Helpers;

use App\Repositories\FacebookRepositoryInterface;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class FacebookHelper implements FacebookRepositoryInterface
{
    protected string $baseUrl;

    /**
     * Fields requested when reading posts back from the Graph API. `attachments` already
     * expands to include media, type, url and subattachments without extra field selectors.
     */
    private const POST_FIELDS = 'id,message,created_time,permalink_url,attachments';

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.facebook.base_url'), '/').'/'.config('services.facebook.version');
    }

    public function getLongLivedToken(string $appId, string $appSecret, string $shortLivedToken): array
    {
        $response = Http::get("{$this->baseUrl}/oauth/access_token", [
            'grant_type' => 'fb_exchange_token',
            'client_id' => $appId,
            'client_secret' => $appSecret,
            'fb_exchange_token' => $shortLivedToken,
        ]);

        if ($response->failed()) {
            $this->logFailure('oauth/access_token', $response, ['app_id' => $appId]);

            throw new RuntimeException(
                $response->json('error.message') ?? 'Failed to generate a long-lived token from Facebook.'
            );
        }

        return $response->json();
    }

    public function getAccounts(string $longLivedToken): array
    {
        $response = Http::withToken($longLivedToken)->get("{$this->baseUrl}/me/accounts", [
            'fields' => 'id,name,access_token,fan_count,link',
        ]);

        if ($response->failed()) {
            $this->logFailure('me/accounts', $response);

            throw new RuntimeException(
                $response->json('error.message') ?? 'Failed to fetch Facebook accounts.'
            );
        }

        return $response->json('data', []);
    }

    public function createTextPost(string $pageAccessToken, string $pageId, string $message): array
    {
        $response = Http::withToken($pageAccessToken)->post("{$this->baseUrl}/{$pageId}/feed", [
            'message' => $message,
        ]);

        if ($response->failed()) {
            $this->logFailure("{$pageId}/feed", $response, ['page_id' => $pageId]);

            throw new RuntimeException(
                $response->json('error.message') ?? 'Failed to publish the post to Facebook.'
            );
        }

        return $response->json();
    }

    public function createImagePost(string $pageAccessToken, string $pageId, string $imageUrl, ?string $caption = null): array
    {
        $response = Http::withToken($pageAccessToken)->post("{$this->baseUrl}/{$pageId}/photos", array_filter([
            'url' => $imageUrl,
            'caption' => $caption,
        ]));

        if ($response->failed()) {
            $this->logFailure("{$pageId}/photos", $response, ['page_id' => $pageId, 'image_url' => $imageUrl]);

            throw new RuntimeException(
                $response->json('error.message') ?? 'Failed to publish the image post to Facebook.'
            );
        }

        return $response->json();
    }

    public function createComment(string $pageAccessToken, string $postId, ?string $message = null, ?string $attachmentUrl = null): array
    {
        $response = Http::withToken($pageAccessToken)->post("{$this->baseUrl}/{$postId}/comments", array_filter([
            'message' => $message,
            'attachment_url' => $attachmentUrl,
        ]));

        if ($response->failed()) {
            $this->logFailure("{$postId}/comments", $response, ['post_id' => $postId]);

            throw new RuntimeException(
                $response->json('error.message') ?? 'Failed to publish the comment to Facebook.'
            );
        }

        return $response->json();
    }

    public function getPagePosts(string $pageAccessToken, string $pageId): array
    {
        $url = "{$this->baseUrl}/{$pageId}/posts";
        $params = [
            'fields' => self::POST_FIELDS,
            'limit' => 100,
        ];

        $posts = [];

        do {
            $response = Http::withToken($pageAccessToken)->timeout(30)->get($url, $params);

            if ($response->failed()) {
                $this->logFailure("{$pageId}/posts", $response, ['page_id' => $pageId]);

                throw new RuntimeException(
                    $response->json('error.message') ?? 'Failed to fetch posts from Facebook.'
                );
            }

            $data = $response->json();

            array_push($posts, ...($data['data'] ?? []));

            // Facebook's next URL already carries every required query parameter, including the token.
            $url = $data['paging']['next'] ?? null;
            $params = [];
        } while ($url);

        return $posts;
    }

    public function getPost(string $pageAccessToken, string $postId): array
    {
        $response = Http::withToken($pageAccessToken)->get("{$this->baseUrl}/{$postId}", [
            'fields' => self::POST_FIELDS,
        ]);

        if ($response->failed()) {
            $this->logFailure($postId, $response, ['post_id' => $postId]);

            throw new RuntimeException(
                $response->json('error.message') ?? 'Failed to fetch the post from Facebook.'
            );
        }

        return $response->json();
    }

    /**
     * Log a failed Facebook Graph API response so failures are traceable in storage/logs/laravel.log.
     */
    private function logFailure(string $endpoint, Response $response, array $context = []): void
    {
        Log::error('Facebook Graph API request failed', [
            'endpoint' => $endpoint,
            'status' => $response->status(),
            'response' => $response->json() ?? $response->body(),
            ...$context,
        ]);
    }
}
