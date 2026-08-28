<?php

namespace App\Http\Controllers;

use App\Models\FacebookApp;
use App\Services\FacebookAppAccountService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class FacebookAppAccountController extends Controller
{
    public function __construct(
        private FacebookAppAccountService $facebookAppAccountService,
    ) {
    }

    public function index(FacebookApp $facebookApp): Response
    {
        $data = $this->facebookAppAccountService->index($facebookApp);

        return Inertia::render('facebook-apps/pages/accounts', [
            'data' => $data,
        ]);
    }

    public function fetch(FacebookApp $facebookApp): RedirectResponse
    {
        try {
            $this->facebookAppAccountService->fetch($facebookApp);
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('facebook-app-accounts.index', $facebookApp)
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('facebook-app-accounts.index', $facebookApp)
            ->with('success', 'Accounts fetched successfully.');
    }
}
