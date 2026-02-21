<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OtpLoginController extends Controller
{
    private const OTP_TTL_SECONDS = 600;

    private const OTP_CACHE_PREFIX = 'otp:login:';

    /**
     * Send OTP to the user's email.
     */
    public function sendOtp(SendOtpRequest $request): RedirectResponse
    {
        $email = Str::lower($request->validated('email'));

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            Log::warning('OTP login: unknown email', ['email' => $email]);

            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        $code = (string) random_int(100000, 999999);
        $key = self::OTP_CACHE_PREFIX.$email;

        Cache::put($key, [
            'code' => $code,
            'user_id' => $user->id,
        ], self::OTP_TTL_SECONDS);

        Mail::to($user->email)->send(new OtpMail($code));

        Log::info('OTP sent', ['email' => $email, 'user_id' => $user->id]);

        return redirect()->route('login')
            ->with('status', __('A login code has been sent to your email.'))
            ->with('otp_email', $email);
    }

    /**
     * Verify OTP and log the user in.
     */
    public function verifyOtp(VerifyOtpRequest $request): RedirectResponse
    {
        $email = Str::lower($request->validated('email'));
        $otpCode = $request->validated('otp_code');
        $key = self::OTP_CACHE_PREFIX.$email;

        $payload = Cache::get($key);

        if (! $payload || ! isset($payload['code'], $payload['user_id'])) {
            Log::warning('OTP verify: invalid or expired', ['email' => $email]);

            throw ValidationException::withMessages([
                'otp_code' => [__('The provided code is invalid or has expired.')],
            ]);
        }

        if (! hash_equals((string) $payload['code'], (string) $otpCode)) {
            Log::warning('OTP verify: wrong code', ['email' => $email]);

            throw ValidationException::withMessages([
                'otp_code' => [__('The provided code is invalid or has expired.')],
            ]);
        }

        Cache::forget($key);

        $user = User::query()->findOrFail($payload['user_id']);
        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        Log::info('Login success', ['user_id' => $user->id, 'redirect' => $this->redirectPath($request)]);

        return redirect()->intended($this->redirectPath($request));
    }

    /**
     * Single handler for POST /login: send OTP or verify OTP based on input.
     */
    public function handle(Request $request): RedirectResponse
    {
        if ($request->filled('otp_code')) {
            $verifyRequest = VerifyOtpRequest::createFrom($request);
            $verifyRequest->setContainer(app())->validateResolved();

            return $this->verifyOtp($verifyRequest);
        }

        $sendRequest = SendOtpRequest::createFrom($request);
        $sendRequest->setContainer(app())->validateResolved();

        return $this->sendOtp($sendRequest);
    }

    private function redirectPath(Request $request): string
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            return route('admin.dashboard');
        }

        return route('student.dashboard');
    }
}
