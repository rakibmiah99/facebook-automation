<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomTemplateRequestStoreRequest;
use App\Models\CustomTemplateRequest;
use App\Services\CustomTemplateRequestService;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CustomTemplateRequestController extends Controller
{
    public function __construct(
        private CustomTemplateRequestService $requestService,
    ) {
    }

    public function index(): Response
    {
        $data = $this->requestService->index();

        return Inertia::render('template-requests/pages/index', [
            'data' => $data,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('template-requests/pages/create');
    }

    public function store(CustomTemplateRequestStoreRequest $request)
    {
        $customTemplateRequest = $this->requestService->store($request);

        return redirect()
            ->route('template-requests.show', $customTemplateRequest)
            ->with('success', 'Your custom template request has been submitted.');
    }

    public function show(CustomTemplateRequest $customTemplateRequest): Response
    {
        $data = $this->requestService->show($customTemplateRequest);

        return Inertia::render('template-requests/pages/show', [
            'data' => $data,
        ]);
    }

    public function cancel(CustomTemplateRequest $customTemplateRequest)
    {
        // HttpException (e.g. the 403 from the ownership check) extends RuntimeException in
        // Symfony, so it must be re-thrown here rather than swallowed as a business-rule error.
        try {
            $this->requestService->cancel($customTemplateRequest);
        } catch (HttpException $e) {
            throw $e;
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Request cancelled.');
    }
}
