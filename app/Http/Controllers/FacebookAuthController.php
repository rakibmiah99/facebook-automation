<?php

namespace App\Http\Controllers;

use App\Services\Facebook\FacebookAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use RuntimeException;

class FacebookAuthController extends Controller
{
    private const STATE_SESSION_KEY = 'facebook_oauth_state';

    public function __construct(
        private FacebookAuthService $facebookAuthService,
    ) {
    }

    public function connect(Request $request): RedirectResponse
    {
        $state = $this->facebookAuthService->generateState();

        $request->session()->put(self::STATE_SESSION_KEY, $state);

        return redirect()->away($this->facebookAuthService->getAuthorizationUrl($state));
    }

    public function callback(Request $request): RedirectResponse
    {
        if ($request->filled('error')) {
            return $this->redirectWithError(
                $request->string('error_description', 'Facebook connection was cancelled.')->toString()
            );
        }

        $expectedState = $request->session()->pull(self::STATE_SESSION_KEY);

        if (! $expectedState || ! hash_equals($expectedState, (string) $request->query('state'))) {
            return $this->redirectWithError('Facebook connection could not be verified. Please try again.');
        }

        $code = (string) $request->query('code');

        if ($code === '') {
            return $this->redirectWithError('Facebook did not return an authorization code.');
        }

        try {
            $this->facebookAuthService->connect($request->user()->id, $code);
        } catch (RuntimeException $exception) {
            return $this->redirectWithError($exception->getMessage());
        }

        return redirect()
            ->route('facebook-apps.index')
            ->with('success', 'Facebook account connected successfully.');
    }

    private function redirectWithError(string $message): RedirectResponse
    {
        return redirect()
            ->route('facebook-apps.index')
            ->with('error', $message);
    }
}
