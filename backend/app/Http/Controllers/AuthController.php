<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $user = $this->authService->login($request, $credentials);

        if (! $user) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        return response()->json([
            'message' => 'Logged in.',
            'user' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request);

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }
}
