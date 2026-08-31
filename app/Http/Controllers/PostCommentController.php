<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostCommentIndexRequest;
use App\Models\Post;
use App\Models\PostComment;
use App\Services\PostCommentService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PostCommentController extends Controller
{
    public function __construct(
        private PostCommentService $postCommentService,
    ) {
    }

    public function index(PostCommentIndexRequest $request, Post $post): Response
    {
        $data = $this->postCommentService->index($post, $request->validated());

        return Inertia::render('posts/pages/comments', [
            'data' => $data,
        ]);
    }

    public function sync(Post $post): RedirectResponse
    {
        try {
            $summary = $this->postCommentService->syncComments($post);
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('posts.comments.index', $post)
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('posts.comments.index', $post)
            ->with('success', "Synced {$summary['total']} comment(s) — {$summary['created']} new, {$summary['updated']} updated.");
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
