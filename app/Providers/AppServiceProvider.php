<?php

namespace App\Providers;

use App\Http\Controllers\Auth\OtpLoginController;
use App\Http\Controllers\Auth\RegistrationController;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerOtpLoginRoute();
        $this->registerRegistrationRoutes();
    }

    /**
     * Register POST /login for OTP flow (before Fortify so it takes precedence).
     */
    private function registerOtpLoginRoute(): void
    {
        Route::middleware('web', 'guest')->group(function (): void {
            Route::post('login', [OtpLoginController::class, 'handle'])
                ->name('login.store')
                ->middleware('throttle:otp-send');
        });
    }

    /**
     * Register registration flow routes (before Fortify so they take precedence).
     */
    private function registerRegistrationRoutes(): void
    {
        Route::middleware('web', 'guest')->group(function (): void {
            Route::get('register', [RegistrationController::class, 'show'])->name('register');
            Route::post('register/send-code', [RegistrationController::class, 'sendCode'])
                ->name('register.sendCode')
                ->middleware('throttle:register-send');
            Route::get('register/verify', [RegistrationController::class, 'showVerify'])->name('register.verify');
            Route::post('register/verify', [RegistrationController::class, 'verifyCode'])->name('register.verify.store');
            Route::get('register/complete', [RegistrationController::class, 'showComplete'])->name('register.complete');
            Route::post('register/complete', [RegistrationController::class, 'complete'])->name('register.complete.store');
            Route::post('register', fn () => redirect()->route('register'))
                ->name('register.store');
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
