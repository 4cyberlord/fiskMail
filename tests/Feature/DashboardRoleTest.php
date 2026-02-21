<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

test('guests are redirected to login when visiting dashboard', function (): void {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('student is redirected to student dashboard when visiting dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertRedirect(route('student.dashboard'));
});

test('admin is redirected to admin dashboard when visiting dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertRedirect(route('admin.dashboard'));
});

test('student can access student dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $response = $this->actingAs($user)->get(route('student.dashboard'));

    $response->assertOk();
});

test('student cannot access admin dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $response = $this->actingAs($user)->get(route('admin.dashboard'));

    $response->assertForbidden();
});

test('admin can access admin dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get(route('admin.dashboard'));

    $response->assertOk();
});

test('admin cannot access student dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get(route('student.dashboard'));

    $response->assertForbidden();
});
