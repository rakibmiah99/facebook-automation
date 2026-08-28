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

    public function index(): array
    {
        return [
            'posts' => Post::query()
                ->where('user_id', Auth::id())
                ->with(['facebookAppAccount:id,account_name,link', 'content', 'comments'])
                ->latest()
                ->paginate(15)
                ->withQueryString(),
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
    private function prepareComment(PostStoreRequest|PostImageStoreRequest $request): array
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
