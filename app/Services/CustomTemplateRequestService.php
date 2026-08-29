<?php

namespace App\Services;

use App\Helpers\UtilsHelper;
use App\Http\Requests\CustomTemplateRequestStoreRequest;
use App\Models\CustomTemplateRequest;
use App\Repositories\MediaHelperRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class CustomTemplateRequestService
{
    public function __construct(
        private MediaHelperRepositoryInterface $mediaHelper,
    ) {
    }

    public function index(): array
    {
        return [
            'requests' => CustomTemplateRequest::query()
                ->where('user_id', Auth::id())
                ->withCount('attachments')
                ->with('templates:id,name,custom_template_request_id')
                ->latest()
                ->paginate(15)
                ->withQueryString(),
        ];
    }

    public function store(CustomTemplateRequestStoreRequest $request): CustomTemplateRequest
    {
        $customTemplateRequest = CustomTemplateRequest::create([
            'user_id' => Auth::id(),
            'title' => $request->validated('title'),
            'aspect_ratio' => $request->validated('aspect_ratio'),
            'width' => $request->validated('width'),
            'height' => $request->validated('height'),
            'description' => $request->validated('description'),
            'status' => CustomTemplateRequest::STATUS_SUBMITTED,
        ]);

        $path = UtilsHelper::MonthYearWisePath('template-requests');

        foreach ($request->file('attachments', []) as $file) {
            $storedPath = $this->mediaHelper->upload($file, $path);

            $customTemplateRequest->attachments()->create([
                'path' => $storedPath,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ]);
        }

        return $customTemplateRequest;
    }

    public function show(CustomTemplateRequest $customTemplateRequest): array
    {
        abort_unless($customTemplateRequest->user_id === Auth::id(), 403);

        $customTemplateRequest->load(['attachments', 'templates', 'handledBy:id,name']);

        return [
            'request' => $customTemplateRequest,
        ];
    }

    public function cancel(CustomTemplateRequest $customTemplateRequest): CustomTemplateRequest
    {
        abort_unless($customTemplateRequest->user_id === Auth::id(), 403);

        if (! in_array($customTemplateRequest->status, CustomTemplateRequest::CANCELLABLE_STATUSES, true)) {
            throw new RuntimeException('This request can no longer be cancelled.');
        }

        $customTemplateRequest->update(['status' => CustomTemplateRequest::STATUS_CANCELLED]);

        return $customTemplateRequest->refresh();
    }
}
