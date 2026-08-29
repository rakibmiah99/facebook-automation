<?php

namespace App\Services\Admin;

use App\Helpers\UtilsHelper;
use App\Http\Requests\Admin\TemplateStoreRequest;
use App\Http\Requests\Admin\TemplateUpdateRequest;
use App\Models\CustomTemplateRequest;
use App\Models\Template;
use App\Models\User;
use App\Repositories\MediaHelperRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class TemplateAdminService
{
    public function __construct(
        private MediaHelperRepositoryInterface $mediaHelper,
    ) {
    }

    public function index(): array
    {
        return [
            'templates' => Template::query()
                ->with(['owner:id,name,email', 'customTemplateRequest:id,title'])
                ->latest()
                ->paginate(20)
                ->withQueryString(),
        ];
    }

    public function create(): array
    {
        return $this->formOptions();
    }

    public function store(TemplateStoreRequest $request): Template
    {
        $previewPath = null;

        if ($request->hasFile('preview')) {
            $previewPath = $this->mediaHelper->upload($request->file('preview'), UtilsHelper::MonthYearWisePath('template-previews'));
        }

        return Template::create([
            'name' => $request->validated('name'),
            'category' => $request->validated('category'),
            'aspect_ratio' => $request->validated('aspect_ratio'),
            'width' => $request->validated('width'),
            'height' => $request->validated('height'),
            'preview_path' => $previewPath,
            'config' => json_decode((string) $request->validated('config'), true),
            'is_common' => $request->boolean('is_common'),
            'is_premium' => $request->boolean('is_premium'),
            'is_active' => $request->boolean('is_active', true),
            'owner_id' => $request->validated('owner_id'),
            'created_by' => Auth::id(),
            'custom_template_request_id' => $request->validated('custom_template_request_id'),
        ]);
    }

    public function edit(Template $template): array
    {
        return [
            ...$this->formOptions(),
            'template' => $template,
            'resolved_config' => $template->resolveConfigUrls(),
        ];
    }

    public function update(TemplateUpdateRequest $request, Template $template): Template
    {
        $previewPath = $template->preview_path;

        if ($request->hasFile('preview')) {
            $previewPath = $this->mediaHelper->upload($request->file('preview'), UtilsHelper::MonthYearWisePath('template-previews'));
        }

        $template->update([
            'name' => $request->validated('name'),
            'category' => $request->validated('category'),
            'aspect_ratio' => $request->validated('aspect_ratio'),
            'width' => $request->validated('width'),
            'height' => $request->validated('height'),
            'preview_path' => $previewPath,
            'config' => json_decode((string) $request->validated('config'), true),
            'is_common' => $request->boolean('is_common'),
            'is_premium' => $request->boolean('is_premium'),
            'is_active' => $request->boolean('is_active', true),
            'owner_id' => $request->validated('owner_id'),
        ]);

        return $template->refresh();
    }

    public function toggleActive(Template $template): Template
    {
        $template->update(['is_active' => ! $template->is_active]);

        return $template->refresh();
    }

    private function formOptions(): array
    {
        return [
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'pending_requests' => CustomTemplateRequest::query()
                ->whereIn('status', [CustomTemplateRequest::STATUS_IN_PROGRESS, CustomTemplateRequest::STATUS_UNDER_REVIEW])
                ->with('user:id,name')
                ->get(['id', 'title', 'user_id', 'aspect_ratio']),
        ];
    }
}
