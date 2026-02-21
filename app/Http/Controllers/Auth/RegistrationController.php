<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CompleteRegistrationRequest;
use App\Http\Requests\Auth\SendRegisterCodeRequest;
use App\Http\Requests\Auth\VerifyRegisterCodeRequest;
use App\Mail\RegisterVerificationMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RegistrationController extends Controller
{
    private const OTP_TTL_SECONDS = 600;

    private const CACHE_PREFIX = 'register:otp:';

    private const SESSION_KEY_NAME = 'register.name';

    private const SESSION_KEY_EMAIL = 'register.email';

    private const SESSION_KEY_VERIFIED = 'register.verified';

    /**
     * Step 1: Show name and email form.
     */
    public function show(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Step 1: Validate name + email, store in session, send 6-digit code, redirect to verify.
     */
    public function sendCode(SendRegisterCodeRequest $request): RedirectResponse
    {
        $name = $request->validated('name');
        $email = Str::lower($request->validated('email'));

        $request->session()->put(self::SESSION_KEY_NAME, $name);
        $request->session()->put(self::SESSION_KEY_EMAIL, $email);

        $code = (string) random_int(100000, 999999);
        $key = self::CACHE_PREFIX.$email;
        Cache::put($key, ['code' => $code], self::OTP_TTL_SECONDS);

        Mail::to($email)->send(new RegisterVerificationMail($code));

        return redirect()->route('register.verify')
            ->with('status', __('A verification code has been sent to your email.'));
    }

    /**
     * Step 2: Show verify code form (email from session, code input).
     */
    public function showVerify(): Response|RedirectResponse
    {
        $email = session(self::SESSION_KEY_EMAIL);
        if (! $email) {
            return redirect()->route('register')->with('error', __('Please enter your name and email first.'));
        }

        return Inertia::render('auth/register-verify', [
            'email' => $email,
            'status' => session('status'),
        ]);
    }

    /**
     * Step 2: Verify code against cache; on success set register.verified and redirect to complete.
     */
    public function verifyCode(VerifyRegisterCodeRequest $request): RedirectResponse
    {
        $email = Str::lower($request->validated('email'));
        $code = $request->validated('code');
        $key = self::CACHE_PREFIX.$email;

        $payload = Cache::get($key);

        if (! $payload || ! isset($payload['code']) || ! hash_equals((string) $payload['code'], (string) $code)) {
            throw ValidationException::withMessages([
                'code' => [__('The provided code is invalid or has expired.')],
            ]);
        }

        Cache::forget($key);
        $request->session()->put(self::SESSION_KEY_VERIFIED, true);

        return redirect()->route('register.complete');
    }

    /**
     * Step 3: Show complete form (verified name + student_id, phone). Redirect if not verified.
     */
    public function showComplete(): Response|RedirectResponse
    {
        if (! session(self::SESSION_KEY_VERIFIED)) {
            return redirect()->route('register')->with('error', __('Please complete the previous steps first.'));
        }

        $name = session(self::SESSION_KEY_NAME);
        $email = session(self::SESSION_KEY_EMAIL);
        if (! $name || ! $email) {
            return redirect()->route('register')->with('error', __('Session expired. Please start again.'));
        }

        return Inertia::render('auth/register-complete', [
            'name' => $name,
            'email' => $email,
        ]);
    }

    /**
     * Step 3: Validate student_id and phone; create User (no password), assign student role; log in; clear session; redirect.
     */
    public function complete(CompleteRegistrationRequest $request): RedirectResponse
    {
        if (! session(self::SESSION_KEY_VERIFIED)) {
            return redirect()->route('register')->with('error', __('Please complete the previous steps first.'));
        }

        $name = session(self::SESSION_KEY_NAME);
        $email = session(self::SESSION_KEY_EMAIL);
        if (! $name || ! $email) {
            return redirect()->route('register')->with('error', __('Session expired. Please start again.'));
        }

        $user = User::query()->create([
            'name' => $name,
            'email' => $email,
            'student_id' => $request->validated('student_id'),
            'phone' => $request->validated('phone'),
            'password' => null,
        ]);

        $user->assignRole(Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']));

        $request->session()->forget([
            self::SESSION_KEY_NAME,
            self::SESSION_KEY_EMAIL,
            self::SESSION_KEY_VERIFIED,
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('student.dashboard'));
    }
}
