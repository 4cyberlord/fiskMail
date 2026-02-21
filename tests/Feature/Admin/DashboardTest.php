<?php

use App\Models\MailItem;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

test('admin can access dashboard and receives kpis and queues', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/dashboard')
        ->has('kpis')
        ->has('expiring_soon_queue')
        ->has('overdue_queue')
        ->has('recent_activity')
        ->has('notification_health')
        ->has('storage_capacity')
        ->has('pickup_volume')
    );
});

test('admin can access pickup desk page', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $student = User::factory()->create(['student_id' => '1111111']);
    $student->assignRole('student');
    MailItem::factory()->create(['user_id' => $student->id, 'picked_up_at' => null]);

    $response = $this->actingAs($admin)->get(route('admin.pickup-desk'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/pickup-desk/index')
        ->has('items', 1)
    );
});

test('admin can mark mail item as picked up', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $student = User::factory()->create();
    $student->assignRole('student');
    $item = MailItem::factory()->create(['user_id' => $student->id, 'picked_up_at' => null]);

    $response = $this->actingAs($admin)->patch(route('admin.mail-items.mark-picked-up', ['id' => $item->id]));

    $response->assertRedirect();
    $item->refresh();
    expect($item->picked_up_at)->not->toBeNull();
});

test('admin can send reminder for mail item', function (): void {
    \Illuminate\Support\Facades\Mail::fake();

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $student = User::factory()->create(['email' => 'student@example.com']);
    $student->assignRole('student');
    $item = MailItem::factory()->create(['user_id' => $student->id, 'picked_up_at' => null]);

    $response = $this->actingAs($admin)->post(route('admin.mail-items.send-reminder', ['id' => $item->id]));

    $response->assertRedirect();
    $notification = \App\Models\UserNotification::query()
        ->where('mail_item_id', $item->id)
        ->where('type', 'reminder')
        ->first();
    expect($notification)->not->toBeNull();
    \Illuminate\Support\Facades\Mail::assertSent(\App\Mail\MailItemReceived::class);
});

test('student cannot access admin dashboard', function (): void {
    $student = User::factory()->create();
    $student->assignRole('student');

    $response = $this->actingAs($student)->get(route('admin.dashboard'));
    $response->assertForbidden();
});

test('student cannot access pickup desk', function (): void {
    $student = User::factory()->create();
    $student->assignRole('student');

    $response = $this->actingAs($student)->get(route('admin.pickup-desk'));
    $response->assertForbidden();
});
