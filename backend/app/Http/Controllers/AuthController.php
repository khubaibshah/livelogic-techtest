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

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
            'password_confirmation' => ['required', 'string', 'min:8'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $user = $this->authService->register($request, $data);

        return response()->json([
            'message' => 'Registered.',
            'user' => $user,
        ], 201);
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
