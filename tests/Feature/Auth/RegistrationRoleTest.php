<?php

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
    Mail::fake();
});

test('new users are assigned student role on registration', function (): void {
    $email = 'student@example.com';
    $code = '123456';
    Cache::put('register:otp:'.strtolower($email), ['code' => $code], 600);

    $this->withSession([
        'register.name' => 'New Student',
        'register.email' => $email,
        'register.verified' => true,
    ]);

    $response = $this->post(route('register.complete.store'), [
        'student_id' => '5555555',
        'phone' => '555-123-4567',
    ]);

    $this->assertAuthenticated();
    $user = auth()->user();
    expect($user->email)->toBe($email)
        ->and($user->hasRole('student'))->toBeTrue();
    $response->assertRedirect(route('student.dashboard'));
});
