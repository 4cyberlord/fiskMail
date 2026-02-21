<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

test('admin can access students list and receives inertia page with students', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $student = User::factory()->create([
        'name' => 'Jane Student',
        'email' => 'jane@example.com',
        'student_id' => '1234567',
        'phone' => '555-1234',
    ]);
    $student->assignRole('student');

    $response = $this->actingAs($admin)->get(route('admin.students'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/students/index')
        ->has('students', 1)
        ->where('students.0.name', 'Jane Student')
        ->where('students.0.email', 'jane@example.com')
        ->where('students.0.student_id', '1234567')
        ->where('students.0.phone', '555-1234')
    );
});

test('student cannot access admin students list', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $response = $this->actingAs($user)->get(route('admin.students'));

    $response->assertForbidden();
});

test('guest cannot access admin students list', function (): void {
    $response = $this->get(route('admin.students'));

    $response->assertRedirect(route('login'));
});
