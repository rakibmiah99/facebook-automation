<?php

namespace App\Repositories;

interface FacebookRepositoryInterface
{
    /**
     * Exchange a short-lived user access token for a long-lived one.
     *
     * @return array{access_token: string, token_type: string, expires_in: int}
     */
    public function getLongLivedToken(string $appId, string $appSecret, string $shortLivedToken): array;

    /**
     * Get the list of Facebook Pages (accounts) managed by the token owner.
     *
     * @return array<int, array{id: string, name: string, access_token: string, fan_count?: int, link?: string}>
     */
    public function getAccounts(string $longLivedToken): array;

    /**
     * Publish a text post to a Facebook Page's feed.
     *
     * @return array{id: string}
     */
    public function createTextPost(string $pageAccessToken, string $pageId, string $message): array;

    /**
     * Publish an image post to a Facebook Page's photos.
     *
     * @return array{id: string, post_id?: string}
     */
    public function createImagePost(string $pageAccessToken, string $pageId, string $imageUrl, ?string $caption = null): array;

    /**
     * Comment on a Facebook post.
     *
     * @return array{id: string}
     */
    public function createComment(string $pageAccessToken, string $postId, ?string $message = null, ?string $attachmentUrl = null): array;
}
