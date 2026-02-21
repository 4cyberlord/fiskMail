<?php

use App\Models\MailItem;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

test('student can access dashboard and receives widget data', function (): void {
    $student = User::factory()->create(['name' => 'Jane', 'student_id' => '1234567']);
    $student->assignRole('student');

    MailItem::factory()->create([
        'user_id' => $student->id,
        'deadline' => now()->addDays(3),
        'picked_up_at' => null,
    ]);

    $response = $this->actingAs($student)->get(route('student.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('student/dashboard')
        ->has('user')
        ->where('user.name', 'Jane')
        ->where('user.student_id', '1234567')
        ->has('counts')
        ->where('counts.ready_for_pickup', 1)
        ->has('next_pickup')
        ->where('next_pickup', fn ($v) => $v !== null)
        ->has('recent_notifications')
        ->has('ready_items_preview')
        ->has('mailroom')
        ->where('mailroom.location', config('mailroom.location'))
    );
});

test('student dashboard shows zero counts when no mail items', function (): void {
    $student = User::factory()->create();
    $student->assignRole('student');

    $response = $this->actingAs($student)->get(route('student.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('counts.ready_for_pickup', 0)
        ->where('counts.overdue', 0)
        ->where('next_pickup', null)
    );
});

test('guest cannot access student dashboard', function (): void {
    $response = $this->get(route('student.dashboard'));
    $response->assertRedirect(route('login'));
});

test('admin cannot access student dashboard', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get(route('student.dashboard'));
    $response->assertForbidden();
});
