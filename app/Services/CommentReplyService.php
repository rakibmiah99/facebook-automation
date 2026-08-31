<?php

namespace App\Services;

use App\Models\FacebookAppAccount;
use App\Models\Post;
use App\Models\PostComment;
use App\Repositories\FacebookRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class CommentReplyService
{
    public function __construct(
        private FacebookRepositoryInterface $facebookRepository,
    ) {
    }

    /**
     * Send a single reply to one comment. A reply is stored as a PostComment row pointing
     * back at its parent via parent_comment_id, so it's the same table a synced reply from
     * Facebook would land in and the two never end up duplicated.
     */
    public function store(PostComment $comment, string $message): PostComment
    {
        $comment->loadMissing('post.facebookAppAccount');
        $post = $comment->post;

        abort_unless($post && $post->user_id === Auth::id(), 403);

        $account = $this->requireAccount($post);
        $this->requireSyncedComment($comment);

        $reply = PostComment::create([
            'post_id' => $post->id,
            'parent_comment_id' => $comment->id,
            'message' => $message,
            'commenter_id' => $account->account_id,
            'commenter_name' => $account->account_name,
            'is_automatic' => false,
        ]);

        $this->sendReply($comment, $reply, $account);

        return $reply->refresh();
    }

    /**
     * Retry a reply that previously failed to reach Facebook.
     */
    public function retry(PostComment $reply): PostComment
    {
        $reply->loadMissing('post.facebookAppAccount', 'parent');
        $post = $reply->post;

        abort_unless($post && $post->user_id === Auth::id(), 403);

        if (! $reply->parent_comment_id) {
            throw new RuntimeException('Only replies can be retried here.');
        }

        if ($reply->comment_id) {
            throw new RuntimeException('Only failed replies can be retried.');
        }

        $account = $this->requireAccount($post);
        $this->requireSyncedComment($reply->parent);

        $this->sendReply($reply->parent, $reply, $account);

        return $reply->refresh();
    }

    /**
     * Automatically reply to every comment on a post that doesn't already have a
     * successful reply, using the same message for each. Skips the Page's own
     * comments (e.g. the auto-comment added when the post was created) so the
     * automation doesn't end up replying to itself.
     *
     * @return array{total: int, sent: int, failed: int}
     */
    public function replyToAll(Post $post, string $message): array
    {
        abort_unless($post->user_id === Auth::id(), 403);

        $post->loadMissing('facebookAppAccount');
        $account = $this->requireAccount($post);

        $comments = $post->comments()
            ->whereNotNull('comment_id')
            ->where(function ($query) use ($account) {
                $query->whereNull('commenter_id')->orWhere('commenter_id', '!=', $account->account_id);
            })
            ->whereDoesntHave('replies', fn ($query) => $query->whereNotNull('comment_id'))
            ->get();

        $summary = ['total' => $comments->count(), 'sent' => 0, 'failed' => 0];

        foreach ($comments as $comment) {
            $reply = PostComment::create([
                'post_id' => $post->id,
                'parent_comment_id' => $comment->id,
                'message' => $message,
                'commenter_id' => $account->account_id,
                'commenter_name' => $account->account_name,
                'is_automatic' => true,
            ]);

            if ($this->sendReply($comment, $reply, $account)) {
                $summary['sent']++;
            } else {
                $summary['failed']++;
            }
        }

        return $summary;
    }

    private function requireAccount(Post $post): FacebookAppAccount
    {
        $account = $post->facebookAppAccount;

        if (! $account) {
            throw new RuntimeException('This post is missing its Facebook Page account and cannot be replied to.');
        }

        return $account;
    }

    private function requireSyncedComment(?PostComment $comment): void
    {
        if (! $comment || ! $comment->comment_id) {
            throw new RuntimeException('This comment has not been synced from Facebook and cannot be replied to.');
        }
    }

    /**
     * Post a reply to Facebook and record the outcome. Returns false (leaving comment_id
     * null) on failure instead of throwing, so bulk replies can keep going and failed
     * ones stay retryable, matching how failed post comments already behave.
     */
    private function sendReply(PostComment $comment, PostComment $reply, FacebookAppAccount $account): bool
    {
        try {
            $response = $this->facebookRepository->createComment(
                $account->access_token,
                $comment->comment_id,
                $reply->message,
            );

            $reply->update(['comment_id' => $response['id'] ?? null]);

            return true;
        } catch (RuntimeException) {
            return false;
        }
    }
}
