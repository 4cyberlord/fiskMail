<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
});

test('guests are redirected to the login page', function (): void {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated students can visit the dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $response = $this->actingAs($user)->get(route('student.dashboard'));

    $response->assertOk();
});
