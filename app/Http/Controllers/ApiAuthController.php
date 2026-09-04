<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApiLoginRequest;
use App\Services\AuthService;

class ApiAuthController extends Controller
{
    public function __construct(
        private AuthService $authService,
    ) {
    }

    public function login(ApiLoginRequest $request)
    {
        $result = $this->authService->apiLogin($request);

        return response()->json([
            'status' => true,
            'message' => 'Login successful.',
            'data' => [
                'user' => $result['user'],
                'token' => $result['token'],
            ],
        ]);
    }
}
