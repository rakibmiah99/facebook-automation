<?php

namespace App\Http\Controllers;

use App\Models\PostComment;
use App\Services\PostCommentService;
use Illuminate\Http\RedirectResponse;
use RuntimeException;

class PostCommentController extends Controller
{
    public function __construct(
        private PostCommentService $postCommentService,
    ) {
    }

    public function retry(PostComment $postComment): RedirectResponse
    {
        try {
            $this->postCommentService->retry($postComment);
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('posts.index')
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('posts.index')
            ->with('success', 'Comment published successfully.');
    }
}
