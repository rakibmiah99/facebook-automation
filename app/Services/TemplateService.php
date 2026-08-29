<?php

namespace App\Services;

use App\Http\Requests\TemplateGenerateRequest;
use App\Models\Template;
use App\Models\TemplateGeneration;
use Illuminate\Support\Facades\Auth;

class TemplateService
{
    public function __construct(
        private TemplateRenderService $renderService,
    ) {
    }

    public function index(): array
    {
        $userId = Auth::id();

        return [
            'common_templates' => Template::query()
                ->where('is_common', true)
                ->where('is_active', true)
                ->latest()
                ->get(),
            'my_templates' => Template::query()
                ->where('owner_id', $userId)
                ->where('is_active', true)
                ->latest()
                ->get(),
        ];
    }

    public function edit(Template $template): array
    {
        $this->authorizeAccess($template);

        $config = $template->resolveConfigUrls();

        // Hidden fields never reach the customize page — stripped here (not just hidden via CSS)
        // so a curious end user can't find them in the Inertia response either. The underlying
        // Template model/DB row is untouched, so TemplateRenderService still draws them normally.
        $config['fields'] = array_values(array_filter(
            $config['fields'] ?? [],
            fn (array $field) => empty($field['hidden']),
        ));

        $template->setAttribute('config', $config);

        return [
            'template' => $template,
            'generations' => TemplateGeneration::query()
                ->where('template_id', $template->id)
                ->where('user_id', Auth::id())
                ->with('posts.facebookAppAccount:id,account_name,link')
                ->latest()
                ->get(),
        ];
    }

    public function generate(TemplateGenerateRequest $request, Template $template): TemplateGeneration
    {
        $this->authorizeAccess($template);

        $values = $request->validated('values', []);
        $images = array_filter($request->file('images', []));

        $path = $this->renderService->render($template, $values, $images);

        return TemplateGeneration::create([
            'template_id' => $template->id,
            'user_id' => Auth::id(),
            'path' => $path,
            'values' => $values,
        ]);
    }

    private function authorizeAccess(Template $template): void
    {
        abort_unless(
            $template->is_common || $template->owner_id === Auth::id(),
            403,
        );
    }
}
