<?php

namespace App\Services;

use App\Helpers\UtilsHelper;
use App\Models\FacebookAppAccount;
use App\Models\Post;
use App\Models\Template;
use App\Models\TemplateGeneration;
use App\Repositories\MediaHelperRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Spatie\Browsershot\Browsershot;
use Throwable;

/**
 * Orchestrates the API-driven counterpart to TemplateService::generate(): renders the template's
 * `config` to a standalone HTML document (see TemplateRenderService + resources/views/templates/
 * render.blade.php), captures it with Browsershot/Puppeteer/Chromium, and stores the result
 * through the same Media Helper pipeline the client-upload flow already uses. Optionally also
 * publishes the result to one Facebook Page in the same call — see generate()'s $pageId.
 */
class TemplateImageGenerationService
{
    public function __construct(
        private TemplateRenderService $templateRenderService,
        private MediaHelperRepositoryInterface $mediaHelper,
        private PostService $postService,
    ) {
    }

    /**
     * Templates visible to the given user (common + their own), for API consumers to discover
     * what's available before generating — mirrors Template::scopeVisibleTo(), the same
     * visibility rule TemplateService::index() already uses for the web UI's template list.
     *
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    public function listAvailable(int $userId): \Illuminate\Support\Collection
    {
        return Template::query()
            ->visibleTo($userId)
            ->where('is_active', true)
            ->latest()
            ->get()
            ->map(fn (Template $template) => [
                'id' => $template->id,
                'name' => $template->name,
                'category' => $template->category,
                'aspect_ratio' => $template->aspect_ratio,
                'width' => $template->width,
                'height' => $template->height,
                'preview_url' => $template->preview_url,
                'is_common' => $template->is_common,
                'is_premium' => $template->is_premium,
            ]);
    }

    /**
     * Describes one template's fields plus a ready-to-use `values` example — every editable
     * field (text or image) gets its key: value entry, value being its current default (text
     * default, or the resolved default image URL for image fields). Non-editable fields are
     * excluded: they always render their `default` and can't be overridden regardless of type.
     *
     * @return array<string, mixed>
     */
    public function describe(Template $template): array
    {
        $this->authorizeAccess($template);

        $config = $template->resolveConfigUrls();
        $fields = $config['fields'] ?? [];

        $fieldsMeta = array_map(function (array $field) {
            $type = $field['type'] ?? 'text';

            return [
                'key' => $field['key'] ?? null,
                'type' => $type,
                'label' => $field['label'] ?? null,
                'editable' => (bool) ($field['editable'] ?? false),
                'default' => $type === 'image' ? ($field['default_url'] ?? null) : ($field['default'] ?? null),
            ];
        }, $fields);

        $valuesExample = [];

        foreach ($fields as $field) {
            $type = $field['type'] ?? 'text';
            $isEditable = (bool) ($field['editable'] ?? false);

            if ($isEditable && ! empty($field['key'])) {
                $valuesExample[$field['key']] = $type === 'image'
                    ? ($field['default_url'] ?? null)
                    : ($field['default'] ?? '');
            }
        }

        return [
            'template_id' => $template->id,
            'name' => $template->name,
            'width' => $template->width,
            'height' => $template->height,
            'background' => $config['background'] ?? null,
            'fields' => $fieldsMeta,
            'values_example' => $valuesExample,
        ];
    }

    /**
     * @param  array<string, mixed>  $values
     * @param  int|null  $pageId  A FacebookAppAccount id owned by the caller (validated in
     *   TemplateImageGenerateRequest) — when given, the generated image is also published to
     *   that one Page immediately after generation. Omit to only generate the image.
     * @param  string|null  $caption  Post caption; only used when $pageId is given.
     * @param  string|null  $commentMessage  First comment to add after publishing, if non-empty;
     *   only used when $pageId is given.
     * @return array{
     *     url: string|null, path: string, template_id: int, generation_id: int,
     *     page_posted: bool, permalink: string|null,
     * }
     */
    public function generate(
        Template $template,
        array $values,
        ?int $pageId = null,
        ?string $caption = null,
        ?string $commentMessage = null,
    ): array {
        $this->authorizeAccess($template);

        $model = $this->templateRenderService->build($template, $values);

        $html = view('templates.render', [
            'model' => $model,
            'fontDataUri' => $this->fontDataUri(),
        ])->render();

        $tempPath = tempnam(sys_get_temp_dir(), 'template_image_').'.png';

        try {
            $this->captureScreenshot($html, $model['width'], $model['height'], $tempPath);

            $uploadedFile = new UploadedFile($tempPath, Str::uuid().'.png', 'image/png', null, true);

            $path = $this->mediaHelper->upload($uploadedFile, UtilsHelper::MonthYearWisePath('templates'));
        } catch (Throwable $e) {
            Log::error('Failed to generate a template image via the API.', [
                'template_id' => $template->id,
                'user_id' => Auth::id(),
                'exception' => $e->getMessage(),
            ]);

            throw $e;
        } finally {
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }
        }

        $generation = TemplateGeneration::create([
            'template_id' => $template->id,
            'user_id' => Auth::id(),
            'path' => $path,
            'values' => $values ?: null,
        ]);

        $result = [
            'url' => UtilsHelper::GetMediaUrl($path),
            'path' => $path,
            'template_id' => $template->id,
            'generation_id' => $generation->id,
            'page_posted' => false,
            'permalink' => null,
        ];

        if ($pageId) {
            return array_merge($result, $this->publishToPage($generation, $pageId, $caption, $commentMessage));
        }

        return $result;
    }

    /**
     * Publishes an already-generated image to one Facebook Page — reuses the exact same
     * publish pipeline the web customize page's "Create Post" step uses
     * (PostService::createFromContentPath), just with a single-account collection and no
     * scheduling (this API is immediate-publish only). A failure here never fails the request:
     * the image was already generated successfully, so it's reported via page_posted: false
     * rather than discarding a successful generation over a Facebook-side error.
     *
     * @return array{page_posted: bool, permalink: string|null}
     */
    private function publishToPage(TemplateGeneration $generation, int $pageId, ?string $caption, ?string $commentMessage): array
    {
        try {
            // Ownership already validated in TemplateImageGenerateRequest's page_id rule —
            // this just fetches the model that validation already confirmed exists and belongs
            // to the caller.
            $account = FacebookAppAccount::query()
                ->where('id', $pageId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $this->postService->createFromContentPath(
                accounts: collect([$account]),
                contentPath: $generation->path,
                caption: $caption,
                isScheduled: false,
                scheduledAt: null,
                addComment: filled($commentMessage),
                commentMessage: $commentMessage,
                templateId: $generation->template_id,
                templateGenerationId: $generation->id,
            );

            $post = Post::query()
                ->where('template_generation_id', $generation->id)
                ->where('facebook_app_account_id', $account->id)
                ->latest()
                ->first();

            if (! $post || ! $post->is_published) {
                return ['page_posted' => false, 'permalink' => null];
            }

            // createFromContentPath doesn't populate permalink_url itself (only the sync flow
            // does) — pull it now so the response can return a real permalink immediately.
            try {
                $post = $this->postService->syncPost($post);
            } catch (Throwable $e) {
                Log::error('Published a template image to Facebook but failed to fetch its permalink.', [
                    'post_id' => $post->id,
                    'user_id' => Auth::id(),
                    'exception' => $e->getMessage(),
                ]);
            }

            return ['page_posted' => true, 'permalink' => $post->permalink_url];
        } catch (Throwable $e) {
            Log::error('Failed to publish a generated template image to a Facebook Page.', [
                'template_generation_id' => $generation->id,
                'page_id' => $pageId,
                'user_id' => Auth::id(),
                'exception' => $e->getMessage(),
            ]);

            return ['page_posted' => false, 'permalink' => null];
        }
    }

    private function captureScreenshot(string $html, int $width, int $height, string $targetPath): void
    {
        $browsershot = Browsershot::html($html)
            ->windowSize($width, $height)
            ->deviceScaleFactor(1)
            ->setScreenshotType('png')
            ->showBackground()
            ->select('#template-root')
            ->waitUntilNetworkIdle()
            ->waitForFunction("document.fonts.status === 'loaded'", timeout: 5000)
            ->timeout(60)
            ->noSandbox();

        if ($chromePath = config('browsershot.chrome_path')) {
            $browsershot->setChromePath($chromePath);
        }

        if ($nodeBinary = config('browsershot.node_binary')) {
            $browsershot->setNodeBinary($nodeBinary);
        }

        if ($npmBinary = config('browsershot.npm_binary')) {
            $browsershot->setNpmBinary($npmBinary);
        }

        $browsershot->save($targetPath);
    }

    private function fontDataUri(): string
    {
        $bytes = file_get_contents(resource_path('fonts/Inter-Variable.ttf'));

        return 'data:font/ttf;base64,'.base64_encode($bytes);
    }

    /** Same rule as TemplateService::authorizeAccess() — not duplicated, just mirrored. */
    private function authorizeAccess(Template $template): void
    {
        abort_unless(
            $template->is_common || $template->owner_id === Auth::id(),
            403,
        );
    }
}
