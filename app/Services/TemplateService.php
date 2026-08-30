<?php

namespace App\Services;

use App\Helpers\UtilsHelper;
use App\Http\Requests\TemplateGenerateRequest;
use App\Models\Template;
use App\Models\TemplateGeneration;
use App\Repositories\MediaHelperRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

class TemplateService
{
    public function __construct(
        private MediaHelperRepositoryInterface $mediaHelper,
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

        // Hidden fields still reach the customize page's preview data — they're drawn into the
        // final generated image the same as any other field, so the preview has to render them
        // too or it stops matching what generate actually produces. "Hidden" only means the
        // customize form gives the end user no input for it (see TemplateEdit's editableFields
        // filter) and the admin-only outline/badge (TemplatePreview's revealHidden) is suppressed.
        $config = $template->resolveConfigUrls();

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

        // The browser already rendered the final image from this same config (see
        // templates/pages/edit.tsx) — nothing left to do server-side but store it through the
        // normal Media Helper pipeline.
        try {
            $path = $this->mediaHelper->upload(
                $request->file('generated_image'),
                UtilsHelper::MonthYearWisePath('templates'),
            );
        } catch (Throwable $e) {
            Log::error('Failed to store a generated template image.', [
                'template_id' => $template->id,
                'user_id' => Auth::id(),
                'exception' => $e->getMessage(),
            ]);

            throw $e;
        }

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
