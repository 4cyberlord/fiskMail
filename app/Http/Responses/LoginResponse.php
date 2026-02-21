<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse(Request $request): RedirectResponse
    {
        $user = $request->user();

        $path = $user && $user->hasRole('admin')
            ? route('admin.dashboard')
            : route('student.dashboard');

        return redirect()->intended($path);
    }
}
