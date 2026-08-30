<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentReplyAllRequest;
use App\Http\Requests\CommentReplyStoreRequest;
use App\Models\CommentReply;
use App\Models\Post;
use App\Models\PostComment;
use App\Services\CommentReplyService;
use Illuminate\Http\RedirectResponse;
use RuntimeException;

class CommentReplyController extends Controller
{
    public function __construct(
        private CommentReplyService $commentReplyService,
    ) {
    }

    public function store(CommentReplyStoreRequest $request, PostComment $postComment): RedirectResponse
    {
        try {
            $this->commentReplyService->store($postComment, $request->validated('message'));
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('posts.comments.index', $postComment->post_id)
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('posts.comments.index', $postComment->post_id)
            ->with('success', 'Reply sent successfully.');
    }

    public function retry(CommentReply $commentReply): RedirectResponse
    {
        $commentReply->loadMissing('comment');

        try {
            $this->commentReplyService->retry($commentReply);
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('posts.comments.index', $commentReply->comment->post_id)
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('posts.comments.index', $commentReply->comment->post_id)
            ->with('success', 'Reply sent successfully.');
    }

    public function replyToAll(CommentReplyAllRequest $request, Post $post): RedirectResponse
    {
        try {
            $summary = $this->commentReplyService->replyToAll($post, $request->validated('message'));
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('posts.comments.index', $post)
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('posts.comments.index', $post)
            ->with('success', "Replied to {$summary['sent']} of {$summary['total']} comment(s).");
    }
}
