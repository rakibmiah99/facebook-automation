<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostImageStoreRequest;
use App\Http\Requests\PostIndexRequest;
use App\Http\Requests\PostStoreRequest;
use App\Models\FacebookAppAccount;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PostController extends Controller
{
    public function __construct(
        private PostService $postService,
    ) {
    }

    public function showText(): Response
    {
        $data = $this->postService->create();

        return Inertia::render('posts/pages/text', [
            'data' => $data,
        ]);
    }

    public function storeText(PostStoreRequest $request): RedirectResponse
    {
        $summary = $this->postService->storeText($request);

        return redirect()
            ->route('posts.text')
            ->with(...$this->summaryFlash($summary));
    }

    public function showImage(): Response
    {
        $data = $this->postService->create();

        return Inertia::render('posts/pages/image', [
            'data' => $data,
        ]);
    }

    public function storeImage(PostImageStoreRequest $request): RedirectResponse
    {
        $summary = $this->postService->storeImage($request);

        return redirect()
            ->route('posts.image')
            ->with(...$this->summaryFlash($summary));
    }

    public function index(PostIndexRequest $request): Response
    {
        $data = $this->postService->index($request->validated());

        return Inertia::render('posts/pages/list', [
            'data' => $data,
        ]);
    }

    public function retry(Post $post): RedirectResponse
    {
        try {
            $this->postService->retry($post);
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('posts.index')
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('posts.index')
            ->with('success', 'Post published successfully.');
    }

    public function syncAccount(FacebookAppAccount $facebookAppAccount): RedirectResponse
    {
        try {
            $summary = $this->postService->syncAccountPosts($facebookAppAccount);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', "Synced {$summary['total']} post(s) — {$summary['created']} new, {$summary['updated']} updated.");
    }

    public function sync(Post $post): RedirectResponse
    {
        try {
            $this->postService->syncPost($post);
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('posts.index')
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('posts.index')
            ->with('success', 'Post synced successfully.');
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function summaryFlash(array $summary): array
    {
        if ($summary['scheduled'] === $summary['total']) {
            $label = $summary['total'] === 1 ? 'post' : 'posts';

            return ['success', "Scheduled {$summary['total']} {$label} successfully."];
        }

        if ($summary['failed'] === 0) {
            return ['success', "Published to {$summary['published']} account(s) successfully."];
        }

        if ($summary['published'] === 0) {
            return ['error', "Failed to publish to all {$summary['failed']} selected account(s)."];
        }

        return ['error', "Published to {$summary['published']} account(s), but {$summary['failed']} failed."];
    }
}
