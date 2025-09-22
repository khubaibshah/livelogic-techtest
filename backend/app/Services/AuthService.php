<?php

namespace App\Services;

use App\Repositories\AuthRepository;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;

class AuthService
{
    public function __construct(private readonly AuthRepository $authRepository)
    {
    }

    public function login(Request $request, array $credentials): ?Authenticatable
    {
        $remember = (bool) ($credentials['remember'] ?? false);

        $authenticated = $this->authRepository->attemptLogin(
            $credentials['email'],
            $credentials['password'],
            $remember
        );

        if (! $authenticated) {
            return null;
        }

        $request->session()->regenerate();

        return $request->user();
    }

    public function logout(Request $request): void
    {
        if (! $request->user()) {
            return;
        }

        $guard = $this->authRepository->guard();

        $this->authRepository->logout($guard);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
