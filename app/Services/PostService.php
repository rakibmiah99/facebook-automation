<?php

namespace App\Services;

use App\Helpers\UtilsHelper;
use App\Http\Requests\PostImageStoreRequest;
use App\Http\Requests\PostStoreRequest;
use App\Models\FacebookAppAccount;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostContent;
use App\Repositories\FacebookRepositoryInterface;
use App\Repositories\MediaHelperRepositoryInterface;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class PostService
{
    public function __construct(
        private FacebookRepositoryInterface $facebookRepository,
        private MediaHelperRepositoryInterface $mediaHelper,
    ) {
    }

    public function create(): array
    {
        return [
            'accounts' => FacebookAppAccount::query()
                ->where('user_id', Auth::id())
                ->orderBy('account_name')
                ->get(['id', 'account_name', 'link']),
        ];
    }

    public function index(array $filters = []): array
    {
        $postType = $filters['post_type'] ?? 'all';

        $posts = Post::query()
            ->where('user_id', Auth::id())
            ->when($filters['account_id'] ?? null, fn ($query, $accountId) => $query->where('facebook_app_account_id', $accountId))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->whereHas('content', fn ($contentQuery) => $contentQuery->where('content_text', 'like', "%{$search}%"));
            })
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
            ->when($filters['status'] ?? null, function ($query, $status) {
                match ($status) {
                    'scheduled' => $query->where('is_scheduled', true),
                    'published' => $query->where('is_scheduled', false)->where('is_published', true),
                    'failed' => $query->where('is_scheduled', false)->where('is_published', false),
                    default => null,
                };
            })
            ->when($postType !== 'all', fn ($query) => $query->where('post_type', $postType))
            ->with(['facebookAppAccount:id,account_name,link', 'content', 'comments'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return [
            'posts' => $posts,
            'accounts' => FacebookAppAccount::query()
                ->where('user_id', Auth::id())
                ->orderBy('account_name')
                ->get(['id', 'account_name']),
            'filters' => [
                'account_id' => $filters['account_id'] ?? null,
                'search' => $filters['search'] ?? null,
                'date_from' => $filters['date_from'] ?? null,
                'date_to' => $filters['date_to'] ?? null,
                'status' => $filters['status'] ?? null,
                'post_type' => $postType,
            ],
        ];
    }

    public function storeText(PostStoreRequest $request): array
    {
        $accounts = FacebookAppAccount::query()
            ->whereIn('id', $request->validated('account_ids'))
            ->where('user_id', Auth::id())
            ->get();

        $isScheduled = $request->boolean('is_scheduled');
        $scheduledAt = $isScheduled ? $request->validated('scheduled_at') : null;
        $content = $request->validated('content_text');
        [$addComment, $commentMessage, $commentAttachmentPath, $commentAttachmentUrl] = $this->prepareComment($request);

        $summary = ['total' => 0, 'published' => 0, 'failed' => 0, 'scheduled' => 0];

        foreach ($accounts as $account) {
            $postId = null;
            $isPublished = false;

            if (! $isScheduled) {
                try {
                    $response = $this->facebookRepository->createTextPost(
                        $account->access_token,
                        $account->account_id,
                        $content,
                    );

                    $postId = $response['id'] ?? null;
                    $isPublished = true;
                    $summary['published']++;
                } catch (RuntimeException) {
                    $summary['failed']++;
                }
            } else {
                $summary['scheduled']++;
            }

            $post = Post::create([
                'facebook_app_account_id' => $account->id,
                'user_id' => Auth::id(),
                'post_id' => $postId,
                'is_published' => $isPublished,
                'is_scheduled' => $isScheduled,
                'scheduled_at' => $scheduledAt,
                'post_type' => 'text',
            ]);

            PostContent::create([
                'post_id' => $post->id,
                'content_type' => 'text',
                'content_text' => $content,
                'content_path' => null,
            ]);

            $this->attemptComment($post, $account->access_token, $postId, $addComment, $commentMessage, $commentAttachmentPath, $commentAttachmentUrl);

            $summary['total']++;
        }

        return $summary;
    }

    public function storeImage(PostImageStoreRequest $request): array
    {
        $accounts = FacebookAppAccount::query()
            ->whereIn('id', $request->validated('account_ids'))
            ->where('user_id', Auth::id())
            ->get();

        $isScheduled = $request->boolean('is_scheduled');
        $scheduledAt = $isScheduled ? $request->validated('scheduled_at') : null;
        $caption = $request->validated('caption');
        [$addComment, $commentMessage, $commentAttachmentPath, $commentAttachmentUrl] = $this->prepareComment($request);

        $path = UtilsHelper::MonthYearWisePath('posts');
        $contentPath = $this->mediaHelper->upload($request->file('image'), $path);

        return $this->createFromContentPath(
            accounts: $accounts,
            contentPath: $contentPath,
            caption: $caption,
            isScheduled: $isScheduled,
            scheduledAt: $scheduledAt,
            addComment: $addComment,
            commentMessage: $commentMessage,
            commentAttachmentPath: $commentAttachmentPath,
            commentAttachmentUrl: $commentAttachmentUrl,
        );
    }

    /**
     * Create one image Post (+ content, optional comment) per Facebook account from a path
     * that has already been uploaded through the Media Helper. This is the single place that
     * fans out to the Facebook image-publish pipeline, shared by direct image-post uploads
     * (storeImage) and template-generated images, so both behave identically end to end.
     *
     * @param  Collection<int, FacebookAppAccount>  $accounts
     */
    public function createFromContentPath(
        Collection $accounts,
        string $contentPath,
        ?string $caption,
        bool $isScheduled,
        ?string $scheduledAt,
        bool $addComment = false,
        ?string $commentMessage = null,
        ?string $commentAttachmentPath = null,
        ?string $commentAttachmentUrl = null,
        ?int $templateId = null,
        ?int $templateGenerationId = null,
    ): array {
        $imageUrl = UtilsHelper::GetMediaUrl($contentPath);

        $summary = ['total' => 0, 'published' => 0, 'failed' => 0, 'scheduled' => 0];

        foreach ($accounts as $account) {
            $postId = null;
            $isPublished = false;

            if (! $isScheduled) {
                try {
                    $response = $this->facebookRepository->createImagePost(
                        $account->access_token,
                        $account->account_id,
                        $imageUrl,
                        $caption,
                    );

                    $postId = $response['post_id'] ?? $response['id'] ?? null;
                    $isPublished = true;
                    $summary['published']++;
                } catch (RuntimeException) {
                    $summary['failed']++;
                }
            } else {
                $summary['scheduled']++;
            }

            $post = Post::create([
                'facebook_app_account_id' => $account->id,
                'user_id' => Auth::id(),
                'template_id' => $templateId,
                'template_generation_id' => $templateGenerationId,
                'post_id' => $postId,
                'is_published' => $isPublished,
                'is_scheduled' => $isScheduled,
                'scheduled_at' => $scheduledAt,
                'post_type' => 'image',
            ]);

            PostContent::create([
                'post_id' => $post->id,
                'content_type' => 'image',
                'content_text' => $caption,
                'content_path' => $contentPath,
            ]);

            $this->attemptComment($post, $account->access_token, $postId, $addComment, $commentMessage, $commentAttachmentPath, $commentAttachmentUrl);

            $summary['total']++;
        }

        return $summary;
    }

    /**
     * Pull every post from a Facebook Page into the local database.
     *
     * @return array{total: int, created: int, updated: int}
     */
    public function syncAccountPosts(FacebookAppAccount $account): array
    {
        abort_unless($account->user_id === Auth::id(), 403);

        $facebookPosts = $this->facebookRepository->getPagePosts($account->access_token, $account->account_id);

        $summary = ['total' => 0, 'created' => 0, 'updated' => 0];

        foreach ($facebookPosts as $facebookPost) {
            [$post, $result] = $this->findOrNewPostFromFacebook($facebookPost, $account);

            if (! $post) {
                continue;
            }

            $this->applyFacebookPostData($post, $facebookPost);

            $summary['total']++;
            $summary[$result]++;
        }

        return $summary;
    }

    /**
     * Re-sync a single post's data (and contents) from Facebook.
     */
    public function syncPost(Post $post): Post
    {
        abort_unless($post->user_id === Auth::id(), 403);

        if (! $post->post_id) {
            throw new RuntimeException('This post has not been published to Facebook yet and cannot be synced.');
        }

        $post->loadMissing('facebookAppAccount');
        $account = $post->facebookAppAccount;

        if (! $account) {
            throw new RuntimeException('This post is missing its Facebook Page account and cannot be synced.');
        }

        $facebookPost = $this->facebookRepository->getPost($account->access_token, $post->post_id);

        $this->applyFacebookPostData($post, $facebookPost);

        return $post->refresh();
    }

    /**
     * @return array{0: ?Post, 1: string} [post, 'created'|'updated'|'skipped']
     */
    private function findOrNewPostFromFacebook(array $facebookPost, FacebookAppAccount $account): array
    {
        $facebookPostId = $facebookPost['id'] ?? null;

        if (! $facebookPostId) {
            return [null, 'skipped'];
        }

        $post = Post::query()
            ->where('facebook_app_account_id', $account->id)
            ->where('post_id', $facebookPostId)
            ->first();

        $isNew = ! $post;

        if (! $post) {
            $post = new Post([
                'facebook_app_account_id' => $account->id,
                'user_id' => $account->user_id,
                'post_id' => $facebookPostId,
            ]);
        }

        return [$post, $isNew ? 'created' : 'updated'];
    }

    /**
     * Apply Facebook's post data onto the local model and rebuild its contents, since Facebook
     * attachments can change and the local copies otherwise go stale.
     */
    private function applyFacebookPostData(Post $post, array $facebookPost): void
    {
        $post->fill([
            'is_published' => true,
            'is_scheduled' => false,
            'scheduled_at' => null,
            'post_type' => $this->resolvePostType($facebookPost),
            'published_at' => $this->parseFacebookDate($facebookPost['created_time'] ?? null),
            'permalink_url' => $facebookPost['permalink_url'] ?? null,
        ]);

        $post->save();

        $post->contents()->delete();

        $this->syncPostContents($post, $facebookPost);
    }

    /**
     * Convert Facebook's created_time into a database datetime.
     */
    private function parseFacebookDate(?string $createdTime): ?string
    {
        if (! $createdTime) {
            return null;
        }

        try {
            return date('Y-m-d H:i:s', strtotime($createdTime));
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Determine the local post_type (text, image, video) from a Facebook post's attachments.
     */
    private function resolvePostType(array $facebookPost): string
    {
        $attachments = $facebookPost['attachments']['data'] ?? [];

        foreach ($attachments as $attachment) {
            if ($this->isVideoAttachment($attachment)) {
                return 'video';
            }

            if ($this->isImageAttachment($attachment)) {
                return 'image';
            }
        }

        return 'text';
    }

    /**
     * Rebuild the local PostContent rows for a post from Facebook's message and attachments.
     */
    private function syncPostContents(Post $post, array $facebookPost): void
    {
        $message = $facebookPost['message'] ?? null;

        if ($message !== null && $message !== '') {
            PostContent::create([
                'post_id' => $post->id,
                'content_type' => 'text',
                'content_path' => null,
                'source_url' => null,
                'content_text' => $message,
            ]);
        }

        $attachments = $facebookPost['attachments']['data'] ?? [];

        foreach ($attachments as $attachment) {
            $this->createAttachmentContent($post, $attachment);

            // Multiple-photo / carousel posts nest their media under subattachments.
            $subAttachments = $attachment['subattachments']['data'] ?? [];

            foreach ($subAttachments as $subAttachment) {
                $this->createAttachmentContent($post, $subAttachment);
            }
        }
    }

    /**
     * Create a local content row from a Facebook attachment. source_url holds the Facebook
     * media URL; content_path (the local/R2 copy) stays null until something downloads it.
     */
    private function createAttachmentContent(Post $post, array $attachment): void
    {
        if ($this->isVideoAttachment($attachment)) {
            $videoUrl = $this->getVideoUrl($attachment);

            if (! $videoUrl) {
                return;
            }

            PostContent::create([
                'post_id' => $post->id,
                'content_type' => 'video',
                'content_path' => null,
                'source_url' => $videoUrl,
                'content_text' => null,
            ]);

            return;
        }

        if ($this->isImageAttachment($attachment)) {
            $imageUrl = $this->getImageUrl($attachment);

            if (! $imageUrl) {
                return;
            }

            PostContent::create([
                'post_id' => $post->id,
                'content_type' => 'image',
                'content_path' => null,
                'source_url' => $imageUrl,
                'content_text' => null,
            ]);
        }
    }

    private function isVideoAttachment(array $attachment): bool
    {
        $type = strtolower($attachment['type'] ?? '');

        if (str_contains($type, 'video')) {
            return true;
        }

        return isset($attachment['media']['source']);
    }

    private function isImageAttachment(array $attachment): bool
    {
        $type = strtolower($attachment['type'] ?? '');

        if (str_contains($type, 'photo') || str_contains($type, 'image')) {
            return true;
        }

        return isset($attachment['media']['image']);
    }

    private function getVideoUrl(array $attachment): ?string
    {
        return $attachment['media']['source'] ?? $attachment['url'] ?? null;
    }

    private function getImageUrl(array $attachment): ?string
    {
        return $attachment['media']['image']['src']
            ?? $attachment['media']['image']['url']
            ?? $attachment['url']
            ?? null;
    }

    public function retry(Post $post): Post
    {
        abort_unless($post->user_id === Auth::id(), 403);

        if ($post->is_published || $post->is_scheduled) {
            throw new RuntimeException('Only failed posts can be retried.');
        }

        $post->loadMissing(['facebookAppAccount', 'content']);
        $account = $post->facebookAppAccount;
        $content = $post->content;

        if (! $account || ! $content) {
            throw new RuntimeException('This post is missing required data and cannot be retried.');
        }

        if ($post->post_type === 'image') {
            if (! $content->content_path) {
                throw new RuntimeException('This image post is missing its uploaded file and cannot be retried.');
            }

            $response = $this->facebookRepository->createImagePost(
                $account->access_token,
                $account->account_id,
                UtilsHelper::GetMediaUrl($content->content_path),
                $content->content_text,
            );

            $postId = $response['post_id'] ?? $response['id'] ?? null;
        } else {
            $response = $this->facebookRepository->createTextPost(
                $account->access_token,
                $account->account_id,
                (string) $content->content_text,
            );

            $postId = $response['id'] ?? null;
        }

        $post->update([
            'post_id' => $postId,
            'is_published' => true,
        ]);

        return $post->refresh();
    }

    /**
     * Upload the optional comment attachment (if any) and resolve the comment inputs shared
     * by both the text and image post forms.
     *
     * @return array{0: bool, 1: ?string, 2: ?string, 3: ?string} [addComment, message, attachmentPath, attachmentUrl]
     */
    private function prepareComment(FormRequest $request): array
    {
        $addComment = $request->boolean('add_comment');

        if (! $addComment) {
            return [false, null, null, null];
        }

        $message = $request->validated('comment_message');
        $attachmentPath = null;
        $attachmentUrl = null;

        if ($request->hasFile('comment_attachment')) {
            $path = UtilsHelper::MonthYearWisePath('comments');
            $attachmentPath = $this->mediaHelper->upload($request->file('comment_attachment'), $path);
            $attachmentUrl = UtilsHelper::GetMediaUrl($attachmentPath);
        }

        return [true, $message, $attachmentPath, $attachmentUrl];
    }

    /**
     * Comment on a freshly created post if requested and the post actually made it to Facebook
     * (skipped for scheduled or failed posts, since there is nothing on Facebook to comment on yet).
     */
    private function attemptComment(
        Post $post,
        string $pageAccessToken,
        ?string $facebookPostId,
        bool $addComment,
        ?string $message,
        ?string $attachmentPath,
        ?string $attachmentUrl,
    ): void {
        if (! $addComment || ! $facebookPostId) {
            return;
        }

        $commentId = null;

        try {
            $response = $this->facebookRepository->createComment(
                $pageAccessToken,
                $facebookPostId,
                $message,
                $attachmentUrl,
            );

            $commentId = $response['id'] ?? null;
        } catch (RuntimeException) {
            // Already logged by FacebookHelper; leave comment_id null to reflect the failure.
        }

        PostComment::create([
            'post_id' => $post->id,
            'comment_id' => $commentId,
            'message' => $message,
            'attachment_path' => $attachmentPath,
        ]);
    }
}
