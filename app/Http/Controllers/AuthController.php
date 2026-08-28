<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService,
    ) {
    }

    public function showLogin(): Response
    {
        return Inertia::render('auth/pages/login');
    }

    public function login(LoginRequest $request): RedirectResponse
    {
        $this->authService->login($request);

        return redirect()
            ->route('dashboard.index')
            ->with('success', 'Welcome back!');
    }

    public function showRegister(): Response
    {
        return Inertia::render('auth/pages/register');
    }

    public function register(RegisterRequest $request): RedirectResponse
    {
        $user = $this->authService->register($request);

        return redirect()
            ->route('dashboard.index')
            ->with('success', "Welcome, {$user->name}!");
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logout($request);

        return redirect()->route('login');
    }
}
