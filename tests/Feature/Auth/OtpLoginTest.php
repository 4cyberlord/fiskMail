<?php

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Mail::fake();
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

test('login screen can be rendered', function (): void {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('sending OTP with valid email redirects back with status', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
    ]);

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('status');
    $response->assertSessionHas('otp_email', strtolower($user->email));
    Mail::assertSent(\App\Mail\OtpMail::class);
});

test('sending OTP with invalid email returns validation error', function (): void {
    $response = $this->post(route('login.store'), [
        'email' => 'nonexistent@example.com',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('verifying valid OTP logs user in and redirects student to student dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $code = '123456';
    $email = strtolower($user->email);
    Cache::put("otp:login:{$email}", [
        'code' => $code,
        'user_id' => $user->id,
    ], 600);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'otp_code' => $code,
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('student.dashboard'));
});

test('verifying valid OTP redirects admin to admin dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $code = '654321';
    $email = strtolower($user->email);
    Cache::put("otp:login:{$email}", [
        'code' => $code,
        'user_id' => $user->id,
    ], 600);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'otp_code' => $code,
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('admin.dashboard'));
});

test('verifying invalid OTP returns validation error', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $email = strtolower($user->email);
    Cache::put("otp:login:{$email}", [
        'code' => '123456',
        'user_id' => $user->id,
    ], 600);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'otp_code' => '000000',
    ]);

    $response->assertSessionHasErrors('otp_code');
    $this->assertGuest();
});

test('users can logout', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

test('OTP send is rate limited', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    for ($i = 0; $i < 5; $i++) {
        $this->post(route('login.store'), ['email' => $user->email]);
    }

    $response = $this->post(route('login.store'), ['email' => $user->email]);
    $response->assertTooManyRequests();
});
