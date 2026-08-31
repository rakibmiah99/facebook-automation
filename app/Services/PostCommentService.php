<?php

namespace App\Services;

use App\Helpers\UtilsHelper;
use App\Models\Post;
use App\Models\PostComment;
use App\Repositories\FacebookRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class PostCommentService
{
    public function __construct(
        private FacebookRepositoryInterface $facebookRepository,
    ) {
    }

    public function index(Post $post, array $filters = []): array
    {
        abort_unless($post->user_id === Auth::id(), 403);

        $comments = $post->comments()
            ->with('replies')
            ->when(
                $filters['commenter'] ?? null,
                fn ($query, $commenter) => $query->where(function ($query) use ($commenter) {
                    $query->where('commenter_name', 'like', "%{$commenter}%")
                        ->orWhereHas('replies', fn ($query) => $query->where('commenter_name', 'like', "%{$commenter}%"));
                }),
            )
            ->when(
                $filters['message'] ?? null,
                fn ($query, $message) => $query->where(function ($query) use ($message) {
                    $query->where('message', 'like', "%{$message}%")
                        ->orWhereHas('replies', fn ($query) => $query->where('message', 'like', "%{$message}%"));
                }),
            )
            ->orderByDesc('commented_at')
            ->orderByDesc('created_at')
            ->get();

        return [
            'post' => $post->load('facebookAppAccount:id,account_name,link'),
            'comments' => $comments,
            'filters' => [
                'commenter' => $filters['commenter'] ?? null,
                'message' => $filters['message'] ?? null,
            ],
        ];
    }

    /**
     * Pull every comment (and reply) left on a post's Facebook post into the local database.
     * Comments and replies share the same table, linked via parent_comment_id, so this keeps
     * each Facebook comment as exactly one row no matter how many times it's synced.
     *
     * @return array{total: int, created: int, updated: int}
     */
    public function syncComments(Post $post): array
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

        $facebookComments = $this->facebookRepository->getPostComments($account->access_token, $post->post_id);

        $summary = ['total' => 0, 'created' => 0, 'updated' => 0];
        $localIdByFacebookId = [];

        foreach ($facebookComments as $facebookComment) {
            $result = $this->syncSingleComment($post, $facebookComment, $localIdByFacebookId);

            if (! $result) {
                continue;
            }

            $summary['total']++;
            $summary[$result]++;
        }

        return $summary;
    }

    private function syncSingleComment(Post $post, array $facebookComment, array &$localIdByFacebookId): ?string
    {
        $facebookCommentId = $facebookComment['id'] ?? null;

        if (! $facebookCommentId) {
            return null;
        }

        $comment = PostComment::query()
            ->where('post_id', $post->id)
            ->where('comment_id', $facebookCommentId)
            ->first();

        $isNew = ! $comment;

        if (! $comment) {
            $comment = new PostComment([
                'post_id' => $post->id,
                'comment_id' => $facebookCommentId,
            ]);
        }

        $comment->fill([
            'parent_comment_id' => $this->resolveParentId($post, $facebookComment, $localIdByFacebookId),
            'message' => $facebookComment['message'] ?? null,
            'commenter_id' => $facebookComment['from']['id'] ?? null,
            'commenter_name' => $facebookComment['from']['name'] ?? null,
            'commented_at' => $this->parseFacebookDate($facebookComment['created_time'] ?? null),
            'image_source_url' => $facebookComment['attachment']['media']['image']['src'] ?? null,
        ]);

        $comment->save();

        $localIdByFacebookId[$facebookCommentId] = $comment->id;

        return $isNew ? 'created' : 'updated';
    }

    /**
     * Facebook's `parent` field points at the post itself for a top-level comment, or at
     * another comment for a reply. Resolve that into the local parent comment's id, checking
     * comments already seen earlier in this sync before falling back to the database (for
     * parents synced in a previous run).
     */
    private function resolveParentId(Post $post, array $facebookComment, array $localIdByFacebookId): ?int
    {
        $parentFacebookId = $facebookComment['parent']['id'] ?? null;

        if (! $parentFacebookId || $parentFacebookId === $post->post_id) {
            return null;
        }

        if (isset($localIdByFacebookId[$parentFacebookId])) {
            return $localIdByFacebookId[$parentFacebookId];
        }

        return PostComment::query()
            ->where('post_id', $post->id)
            ->where('comment_id', $parentFacebookId)
            ->value('id');
    }

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

    public function retry(PostComment $comment): PostComment
    {
        $comment->loadMissing(['post.facebookAppAccount']);
        $post = $comment->post;

        abort_unless($post && $post->user_id === Auth::id(), 403);

        if ($comment->parent_comment_id) {
            throw new RuntimeException('This is a reply, not a top-level comment, and cannot be retried here.');
        }

        if ($comment->comment_id) {
            throw new RuntimeException('Only failed comments can be retried.');
        }

        if (! $post->is_published || ! $post->post_id) {
            throw new RuntimeException('The related post has not been published to Facebook yet.');
        }

        $account = $post->facebookAppAccount;

        if (! $account) {
            throw new RuntimeException('This comment is missing its Facebook account and cannot be retried.');
        }

        $attachmentUrl = $comment->attachment_path ? UtilsHelper::GetMediaUrl($comment->attachment_path) : null;

        $response = $this->facebookRepository->createComment(
            $account->access_token,
            $post->post_id,
            $comment->message,
            $attachmentUrl,
        );

        $comment->update([
            'comment_id' => $response['id'] ?? null,
        ]);

        return $comment->refresh();
    }
}
