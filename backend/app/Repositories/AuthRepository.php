<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Auth;

class AuthRepository
{
    public function attemptLogin(string $email, string $password, bool $remember = false): bool
    {
        return Auth::attempt([
            'email' => $email,
            'password' => $password,
        ], $remember);
    }

    public function logout(string $guard): void
    {
        Auth::guard($guard)->logout();
    }

    public function guard(): string
    {
        $guard = config('sanctum.guard', 'web');

        if (is_array($guard)) {
            return $guard[0] ?? 'web';
        }

        return $guard;
    }
}
