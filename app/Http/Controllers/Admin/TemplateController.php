<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TemplateStoreRequest;
use App\Http\Requests\Admin\TemplateUpdateRequest;
use App\Models\Template;
use App\Services\Admin\TemplateAdminService;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    public function __construct(
        private TemplateAdminService $templateAdminService,
    ) {
    }

    public function index(): Response
    {
        $data = $this->templateAdminService->index();

        return Inertia::render('admin/templates/pages/index', [
            'data' => $data,
        ]);
    }

    public function create(): Response
    {
        $data = $this->templateAdminService->create();

        return Inertia::render('admin/templates/pages/create', [
            'data' => $data,
        ]);
    }

    public function store(TemplateStoreRequest $request)
    {
        $template = $this->templateAdminService->store($request);

        return redirect()
            ->route('admin.templates.edit', $template)
            ->with('success', 'Template created.');
    }

    public function edit(Template $template): Response
    {
        $data = $this->templateAdminService->edit($template);

        return Inertia::render('admin/templates/pages/edit', [
            'data' => $data,
        ]);
    }

    public function update(TemplateUpdateRequest $request, Template $template)
    {
        $this->templateAdminService->update($request, $template);

        return redirect()
            ->route('admin.templates.index')
            ->with('success', 'Template updated.');
    }

    public function toggle(Template $template)
    {
        $this->templateAdminService->toggleActive($template);

        return back()->with('success', 'Template status updated.');
    }
}
