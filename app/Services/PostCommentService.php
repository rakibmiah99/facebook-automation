<?php

namespace App\Services;

use App\Helpers\UtilsHelper;
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

    public function retry(PostComment $comment): PostComment
    {
        $comment->loadMissing(['post.facebookAppAccount']);
        $post = $comment->post;

        abort_unless($post && $post->user_id === Auth::id(), 403);

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
