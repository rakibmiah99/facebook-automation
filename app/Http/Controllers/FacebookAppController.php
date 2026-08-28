<?php

namespace App\Http\Controllers;

use App\Http\Requests\FacebookAppStoreRequest;
use App\Http\Requests\FacebookAppUpdateRequest;
use App\Models\FacebookApp;
use App\Services\FacebookAppService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class FacebookAppController extends Controller
{
    public function __construct(
        private FacebookAppService $facebookAppService,
    ) {
    }

    public function index(): Response
    {
        $data = $this->facebookAppService->index();

        return Inertia::render('facebook-apps/pages/index', [
            'data' => $data,
        ]);
    }

    public function store(FacebookAppStoreRequest $request): RedirectResponse
    {
        $this->facebookAppService->store($request);

        return redirect()
            ->route('facebook-apps.index')
            ->with('success', 'Facebook app created successfully.');
    }

    public function update(FacebookAppUpdateRequest $request, FacebookApp $facebookApp): RedirectResponse
    {
        $this->facebookAppService->update($request, $facebookApp);

        return redirect()
            ->route('facebook-apps.index')
            ->with('success', 'Facebook app updated successfully.');
    }

    public function destroy(FacebookApp $facebookApp): RedirectResponse
    {
        $this->facebookAppService->destroy($facebookApp);

        return redirect()
            ->route('facebook-apps.index')
            ->with('success', 'Facebook app deleted successfully.');
    }

    public function generateToken(FacebookApp $facebookApp): RedirectResponse
    {
        try {
            $this->facebookAppService->generateLongLivedToken($facebookApp);
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('facebook-apps.index')
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('facebook-apps.index')
            ->with('success', 'Long-lived token generated successfully.');
    }
}
