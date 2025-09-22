<?php

namespace App\Services;

use App\Repositories\AuthRepository;
use Illuminate\Auth\AuthenticationException;
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

    public function register(Request $request, array $data): Authenticatable
    {
        $remember = (bool) ($data['remember'] ?? false);

        $user = $this->authRepository->createUser([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        $authenticated = $this->authRepository->attemptLogin(
            $data['email'],
            $data['password'],
            $remember
        );

        if (! $authenticated) {
            throw new AuthenticationException('Registration succeeded but automatic login failed.');
        }

        $request->session()->regenerate();

        return $request->user() ?? $user;
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
