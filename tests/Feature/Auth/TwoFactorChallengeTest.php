<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('two factor challenge redirects to login when not authenticated', function () {
    if (! Features::canManageTwoFactorAuthentication()) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }

    $response = $this->get(route('two-factor.login'));

    $response->assertRedirect(route('login'));
});

test('two factor challenge can be rendered', function () {
    if (! Features::canManageTwoFactorAuthentication()) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }

    $this->markTestSkipped('Primary login uses OTP; Fortify 2FA challenge flow is not used for initial login.');
});