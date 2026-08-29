<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CustomTemplateRequestUpdateRequest;
use App\Models\CustomTemplateRequest;
use App\Services\Admin\CustomTemplateRequestAdminService;
use Inertia\Inertia;
use Inertia\Response;

class CustomTemplateRequestController extends Controller
{
    public function __construct(
        private CustomTemplateRequestAdminService $requestAdminService,
    ) {
    }

    public function index(): Response
    {
        $data = $this->requestAdminService->index();

        return Inertia::render('admin/template-requests/pages/index', [
            'data' => $data,
        ]);
    }

    public function show(CustomTemplateRequest $customTemplateRequest): Response
    {
        $data = $this->requestAdminService->show($customTemplateRequest);

        return Inertia::render('admin/template-requests/pages/show', [
            'data' => $data,
        ]);
    }

    public function update(CustomTemplateRequestUpdateRequest $request, CustomTemplateRequest $customTemplateRequest)
    {
        $this->requestAdminService->update($request, $customTemplateRequest);

        return back()->with('success', 'Request updated.');
    }
}
