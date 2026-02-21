<?php

use App\Mail\RegisterVerificationMail;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
    Mail::fake();
});

test('registration screen can be rendered', function (): void {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('step 1 send code validates name and email and redirects to verify', function (): void {
    $response = $this->post(route('register.sendCode'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);

    $response->assertRedirect(route('register.verify'));
    $response->assertSessionHas('register.name', 'Test User');
    $response->assertSessionHas('register.email', 'test@example.com');
    Mail::assertSent(RegisterVerificationMail::class);
});

test('step 1 rejects duplicate email', function (): void {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->post(route('register.sendCode'), [
        'name' => 'Test User',
        'email' => 'existing@example.com',
    ]);

    $response->assertSessionHasErrors('email');
    Mail::assertNotSent(RegisterVerificationMail::class);
});

test('step 2 verify code redirects to complete and step 3 creates user with student_id and phone and no password', function (): void {
    $email = 'newuser@example.com';
    $name = 'New User';
    $code = '123456';
    $key = 'register:otp:'.strtolower($email);
    Cache::put($key, ['code' => $code], 600);

    $this->withSession([
        'register.name' => $name,
        'register.email' => $email,
    ]);

    $verifyResponse = $this->post(route('register.verify.store'), [
        'email' => $email,
        'code' => $code,
    ]);

    $verifyResponse->assertRedirect(route('register.complete'));
    $this->get(route('register.complete'))->assertOk();

    $completeResponse = $this->post(route('register.complete.store'), [
        'student_id' => '9876543',
        'phone' => '555-123-4567',
    ]);

    $completeResponse->assertRedirect(route('student.dashboard'));
    $this->assertAuthenticated();

    $user = User::query()->where('email', $email)->first();
    expect($user)->not->toBeNull()
        ->and($user->name)->toBe($name)
        ->and($user->student_id)->toBe('9876543')
        ->and($user->phone)->toBe('555-123-4567')
        ->and($user->password)->toBeNull()
        ->and($user->hasRole('student'))->toBeTrue();
});

test('step 3 rejects duplicate student_id', function (): void {
    User::factory()->create(['student_id' => '1111111', 'email' => 'other@example.com']);
    $email = 'newuser@example.com';
    $code = '123456';
    Cache::put('register:otp:'.strtolower($email), ['code' => $code], 600);

    $this->withSession([
        'register.name' => 'New User',
        'register.email' => $email,
        'register.verified' => true,
    ]);

    $response = $this->post(route('register.complete.store'), [
        'student_id' => '1111111',
        'phone' => '555-999-9999',
    ]);

    $response->assertSessionHasErrors('student_id');
    expect(User::query()->where('email', $email)->exists())->toBeFalse();
});

test('step 2 invalid or expired code returns validation error', function (): void {
    $response = $this->post(route('register.verify.store'), [
        'email' => 'any@example.com',
        'code' => '000000',
    ]);

    $response->assertSessionHasErrors('code');
});

test('complete step without verified session redirects to register', function (): void {
    $response = $this->get(route('register.complete'));

    $response->assertRedirect(route('register'));
});
