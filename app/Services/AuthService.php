<?php

namespace App\Services;

use App\Http\Requests\ApiLoginRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * @throws ValidationException
     */
    public function login(LoginRequest $request): User
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials, (bool) $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $request->session()->regenerate();

        return Auth::user();
    }

    /**
     * Stateless counterpart of login() for the token API (routes/api.php): checks credentials
     * directly instead of Auth::attempt(), since the `api` middleware group has no session store
     * to persist a guard state into, and issues a Sanctum personal access token instead of a
     * session.
     *
     * @throws ValidationException
     */
    public function apiLogin(ApiLoginRequest $request): array
    {
        $user = User::query()->where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $token = $user->createToken($request->validated('device_name') ?: 'api')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function register(RegisterRequest $request): User
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'company' => $request->validated('company'),
            'role' => $request->validated('role'),
        ]);

        Auth::login($user);

        $request->session()->regenerate();

        return $user;
    }

    public function logout(Request $request): void
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
