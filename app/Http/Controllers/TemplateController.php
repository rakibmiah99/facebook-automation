<?php

namespace App\Http\Controllers;

use App\Helpers\UtilsHelper;
use App\Http\Requests\TemplateGenerateRequest;
use App\Http\Requests\TemplatePostRequest;
use App\Models\FacebookAppAccount;
use App\Models\Template;
use App\Models\TemplateGeneration;
use App\Repositories\MediaHelperRepositoryInterface;
use App\Services\PostService;
use App\Services\TemplateService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class TemplateController extends Controller
{
    public function __construct(
        private TemplateService $templateService,
        private PostService $postService,
        private MediaHelperRepositoryInterface $mediaHelper,
    ) {
    }

    public function index(): Response
    {
        $data = $this->templateService->index();

        return Inertia::render('templates/pages/index', [
            'data' => $data,
        ]);
    }

    public function edit(Template $template): Response
    {
        $data = $this->templateService->edit($template);

        $data['accounts'] = FacebookAppAccount::query()
            ->where('user_id', Auth::id())
            ->orderBy('account_name')
            ->get(['id', 'account_name', 'link']);

        return Inertia::render('templates/pages/edit', [
            'data' => $data,
        ]);
    }

    public function generate(TemplateGenerateRequest $request, Template $template)
    {
        $generation = $this->templateService->generate($request, $template);

        return back()->with('generated', $generation);
    }

    public function storePost(TemplatePostRequest $request, Template $template, TemplateGeneration $generation)
    {
        abort_unless(
            $generation->template_id === $template->id && $generation->user_id === Auth::id(),
            403,
        );

        $accounts = FacebookAppAccount::query()
            ->whereIn('id', $request->validated('account_ids'))
            ->where('user_id', Auth::id())
            ->get();

        $addComment = $request->boolean('add_comment');
        $commentMessage = $addComment ? $request->validated('comment_message') : null;
        $commentAttachmentPath = null;
        $commentAttachmentUrl = null;

        if ($addComment && $request->hasFile('comment_attachment')) {
            $path = UtilsHelper::MonthYearWisePath('comments');
            $commentAttachmentPath = $this->mediaHelper->upload($request->file('comment_attachment'), $path);
            $commentAttachmentUrl = UtilsHelper::GetMediaUrl($commentAttachmentPath);
        }

        try {
            $summary = $this->postService->createFromContentPath(
                accounts: $accounts,
                contentPath: $generation->path,
                caption: $request->validated('caption'),
                isScheduled: $request->boolean('is_scheduled'),
                scheduledAt: $request->boolean('is_scheduled') ? $request->validated('scheduled_at') : null,
                addComment: $addComment,
                commentMessage: $commentMessage,
                commentAttachmentPath: $commentAttachmentPath,
                commentAttachmentUrl: $commentAttachmentUrl,
                templateId: $template->id,
                templateGenerationId: $generation->id,
            );
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        $message = $summary['scheduled'] > 0
            ? "Scheduled {$summary['scheduled']} post(s) from this template."
            : "Published {$summary['published']} post(s), {$summary['failed']} failed.";

        return redirect()->route('posts.index')->with('success', $message);
    }
}
