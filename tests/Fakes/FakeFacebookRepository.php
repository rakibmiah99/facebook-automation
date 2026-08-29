<?php

namespace Tests\Fakes;

use App\Repositories\FacebookRepositoryInterface;

/**
 * Stands in for the real Graph API caller in tests so no network calls are made while
 * exercising the publish/schedule pipeline shared by direct image posts and templates.
 */
class FakeFacebookRepository implements FacebookRepositoryInterface
{
    public function getLongLivedToken(string $appId, string $appSecret, string $shortLivedToken): array
    {
        return ['access_token' => 'fake-long-lived-token', 'token_type' => 'bearer', 'expires_in' => 5184000];
    }

    public function getAccounts(string $longLivedToken): array
    {
        return [];
    }

    public function createTextPost(string $pageAccessToken, string $pageId, string $message): array
    {
        return ['id' => 'fake_post_'.uniqid()];
    }

    public function createImagePost(string $pageAccessToken, string $pageId, string $imageUrl, ?string $caption = null): array
    {
        return ['id' => 'fake_photo_'.uniqid(), 'post_id' => 'fake_post_'.uniqid()];
    }

    public function createComment(string $pageAccessToken, string $postId, ?string $message = null, ?string $attachmentUrl = null): array
    {
        return ['id' => 'fake_comment_'.uniqid()];
    }
}
