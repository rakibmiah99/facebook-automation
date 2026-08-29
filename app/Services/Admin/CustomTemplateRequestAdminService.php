<?php

namespace App\Services\Admin;

use App\Http\Requests\Admin\CustomTemplateRequestUpdateRequest;
use App\Models\CustomTemplateRequest;
use Illuminate\Support\Facades\Auth;

class CustomTemplateRequestAdminService
{
    public function index(): array
    {
        return [
            'requests' => CustomTemplateRequest::query()
                ->with('user:id,name,email')
                ->withCount('attachments')
                ->latest()
                ->paginate(20)
                ->withQueryString(),
        ];
    }

    public function show(CustomTemplateRequest $customTemplateRequest): array
    {
        $customTemplateRequest->load(['attachments', 'user:id,name,email', 'handledBy:id,name', 'templates']);

        return [
            'request' => $customTemplateRequest,
        ];
    }

    public function update(CustomTemplateRequestUpdateRequest $request, CustomTemplateRequest $customTemplateRequest): CustomTemplateRequest
    {
        $customTemplateRequest->update([
            'status' => $request->validated('status'),
            'admin_notes' => $request->validated('admin_notes'),
            'handled_by' => Auth::id(),
        ]);

        return $customTemplateRequest->refresh();
    }
}
