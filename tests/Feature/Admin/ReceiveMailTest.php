<?php

use App\Mail\MailItemReceived;
use App\Models\MailItem;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

test('admin can access receive mail page', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get(route('admin.receive-mail'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/receive-mail/index')
        ->has('itemTypes')
        ->has('carriers')
    );
});

test('admin can store a mail item without notify', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $student = User::factory()->create(['student_id' => '9876543']);
    $student->assignRole('student');

    $deadline = now()->addDays(5)->format('Y-m-d');

    $response = $this->actingAs($admin)->post(route('admin.receive-mail.store'), [
        'user_id' => $student->id,
        'item_type' => 'package',
        'carrier' => 'usps',
        'tracking_number' => 'TRK123',
        'is_sensitive' => false,
        'notes' => 'Fragile',
        'deadline' => $deadline,
    ]);

    $response->assertRedirect(route('admin.receive-mail'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('mail_items', [
        'user_id' => $student->id,
        'item_type' => 'package',
        'carrier' => 'usps',
        'tracking_number' => 'TRK123',
        'is_sensitive' => false,
        'notes' => 'Fragile',
        'notified_at' => null,
    ]);
});

test('admin can store a mail item with notify and sends email', function (): void {
    Mail::fake();

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $student = User::factory()->create(['student_id' => '1111111', 'email' => 'student@example.com']);
    $student->assignRole('student');

    $deadline = now()->addDays(5)->format('Y-m-d');

    $response = $this->actingAs($admin)->post(route('admin.receive-mail.store'), [
        'user_id' => $student->id,
        'item_type' => 'letter',
        'carrier' => 'fedex',
        'tracking_number' => null,
        'is_sensitive' => true,
        'notes' => null,
        'deadline' => $deadline,
        'notify' => true,
    ]);

    $response->assertRedirect(route('admin.receive-mail'));

    $mailItem = MailItem::query()->where('user_id', $student->id)->first();
    expect($mailItem)->not->toBeNull()
        ->and($mailItem->notified_at)->not->toBeNull();

    Mail::assertSent(MailItemReceived::class, function ($mail) use ($student) {
        return $mail->hasTo($student->email);
    });
});

test('store validates required fields', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post(route('admin.receive-mail.store'), [
        'user_id' => null,
        'item_type' => 'invalid',
        'carrier' => 'invalid',
        'deadline' => '',
    ]);

    $response->assertSessionHasErrors(['user_id', 'item_type', 'carrier', 'deadline']);
});

test('store validates user_id is a student', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $otherAdmin = User::factory()->create();
    $otherAdmin->assignRole('admin');

    $response = $this->actingAs($admin)->post(route('admin.receive-mail.store'), [
        'user_id' => $otherAdmin->id,
        'item_type' => 'package',
        'carrier' => 'amazon',
        'deadline' => now()->addDays(5)->format('Y-m-d'),
    ]);

    $response->assertSessionHasErrors(['user_id']);
});

test('student cannot access receive mail page', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $response = $this->actingAs($user)->get(route('admin.receive-mail'));

    $response->assertForbidden();
});

test('guest cannot access receive mail page', function (): void {
    $response = $this->get(route('admin.receive-mail'));

    $response->assertRedirect(route('login'));
});

test('student lookup returns id and name for valid student_id', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $student = User::factory()->create(['name' => 'Jane Doe', 'student_id' => '5555555']);
    $student->assignRole('student');

    $response = $this->actingAs($admin)->getJson(route('admin.students.lookup', ['student_id' => '5555555']));

    $response->assertOk();
    $response->assertJson(['id' => $student->id, 'name' => 'Jane Doe']);
});

test('student lookup returns 404 for unknown student_id', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->getJson(route('admin.students.lookup', ['student_id' => '0000000']));

    $response->assertStatus(404);
    $response->assertJson(['message' => 'Student not found']);
});

test('student lookup validates student_id format', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->getJson(route('admin.students.lookup', ['student_id' => '123']));

    $response->assertStatus(422);
});
