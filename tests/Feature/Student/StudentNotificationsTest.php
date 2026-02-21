<?php

use App\Models\MailItem;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

test('admin store with notify creates in-app notification for student', function (): void {
    Mail::fake();

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $student = User::factory()->create(['student_id' => '1111111']);
    $student->assignRole('student');

    $deadline = now()->addDays(5)->format('Y-m-d');

    $this->actingAs($admin)->post(route('admin.receive-mail.store'), [
        'user_id' => $student->id,
        'item_type' => 'package',
        'carrier' => 'usps',
        'tracking_number' => 'TRK999',
        'is_sensitive' => false,
        'notes' => null,
        'deadline' => $deadline,
        'notify' => true,
    ]);

    $notification = UserNotification::query()
        ->where('user_id', $student->id)
        ->where('type', 'received')
        ->first();

    expect($notification)->not->toBeNull()
        ->and($notification->title)->toBe('Package Ready for Pickup')
        ->and($notification->is_sensitive)->toBeFalse()
        ->and($notification->mail_item_id)->not->toBeNull();

    $response = $this->actingAs($student)->get(route('student.notifications.index'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('student/notifications/index')
        ->has('notifications', 1)
        ->where('notifications.0.title', 'Package Ready for Pickup')
    );
});

test('admin notify student then student sees notification on dashboard list and header count', function (): void {
    Mail::fake();

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $student = User::factory()->create(['student_id' => '2222222']);
    $student->assignRole('student');

    $deadline = now()->addDays(5)->format('Y-m-d');

    $this->actingAs($admin)->post(route('admin.receive-mail.store'), [
        'user_id' => $student->id,
        'item_type' => 'letter',
        'carrier' => 'usps',
        'tracking_number' => null,
        'is_sensitive' => false,
        'notes' => null,
        'deadline' => $deadline,
        'notify' => true,
    ]);

    expect(UserNotification::query()->where('user_id', $student->id)->count())->toBe(1);

    $dashboardResponse = $this->actingAs($student)->get(route('student.dashboard'));
    $dashboardResponse->assertOk();
    $dashboardResponse->assertInertia(fn (Assert $page) => $page
        ->component('student/dashboard')
        ->has('recent_notifications', 1)
        ->where('recent_notifications.0.title', 'Letter Ready for Pickup')
        ->where('unread_notifications_count', 1)
    );

    $notificationsResponse = $this->actingAs($student)->get(route('student.notifications.index'));
    $notificationsResponse->assertOk();
    $notificationsResponse->assertInertia(fn (Assert $page) => $page
        ->component('student/notifications/index')
        ->has('notifications', 1)
        ->where('notifications.0.title', 'Letter Ready for Pickup')
    );
});

test('student cannot see another student notifications', function (): void {
    $studentA = User::factory()->create();
    $studentA->assignRole('student');
    $studentB = User::factory()->create();
    $studentB->assignRole('student');

    $mailItem = MailItem::factory()->create(['user_id' => $studentB->id]);
    $notification = UserNotification::query()->create([
        'user_id' => $studentB->id,
        'mail_item_id' => $mailItem->id,
        'title' => 'Package Ready',
        'message' => 'A package arrived.',
        'type' => 'received',
        'is_sensitive' => false,
        'is_read' => false,
    ]);

    $response = $this->actingAs($studentA)->get(route('student.notifications.show', ['id' => $notification->id]));

    $response->assertNotFound();
});

test('student cannot view another student mail item', function (): void {
    $studentA = User::factory()->create();
    $studentA->assignRole('student');
    $studentB = User::factory()->create();
    $studentB->assignRole('student');

    $mailItem = MailItem::factory()->create(['user_id' => $studentB->id]);

    $response = $this->actingAs($studentA)->get(route('student.mail-items.show', ['id' => $mailItem->id]));

    $response->assertNotFound();
});

test('notification detail and mail item do not expose carrier tracking notes when sensitive', function (): void {
    $student = User::factory()->create();
    $student->assignRole('student');

    $mailItem = MailItem::factory()->create([
        'user_id' => $student->id,
        'item_type' => 'package',
        'carrier' => 'fedex',
        'tracking_number' => 'SECRET123',
        'notes' => 'Confidential',
        'is_sensitive' => true,
    ]);

    $notification = UserNotification::query()->create([
        'user_id' => $student->id,
        'mail_item_id' => $mailItem->id,
        'title' => 'Sensitive Item Ready',
        'message' => 'You have an item ready for pickup at the mailroom.',
        'type' => 'received',
        'is_sensitive' => true,
        'is_read' => false,
    ]);

    $showResponse = $this->actingAs($student)->get(route('student.notifications.show', ['id' => $notification->id]));
    $showResponse->assertOk();
    $showResponse->assertInertia(fn (Assert $page) => $page
        ->component('student/notifications/show')
        ->has('mail_item')
        ->where('mail_item.is_sensitive', true)
        ->missing('mail_item.carrier')
        ->missing('mail_item.tracking_number')
        ->missing('mail_item.notes')
    );

    $mailItemResponse = $this->actingAs($student)->get(route('student.mail-items.show', ['id' => $mailItem->id]));
    $mailItemResponse->assertOk();
    $mailItemResponse->assertInertia(fn (Assert $page) => $page
        ->component('student/mail-items/show')
        ->has('mail_item')
        ->where('mail_item.is_sensitive', true)
        ->missing('mail_item.carrier')
        ->missing('mail_item.tracking_number')
        ->missing('mail_item.notes')
    );
});

test('student can mark all notifications as read', function (): void {
    $student = User::factory()->create();
    $student->assignRole('student');
    $mailItem = MailItem::factory()->create(['user_id' => $student->id]);

    UserNotification::query()->create([
        'user_id' => $student->id,
        'mail_item_id' => $mailItem->id,
        'title' => 'One',
        'message' => 'First.',
        'type' => 'received',
        'is_sensitive' => false,
        'is_read' => false,
    ]);

    $response = $this->actingAs($student)->post(route('student.notifications.mark-all-read'));
    $response->assertRedirect(route('student.notifications.index'));
    $response->assertSessionHas('success');

    expect(UserNotification::query()->where('user_id', $student->id)->where('is_read', false)->count())->toBe(0);
});

test('student can mark all notifications as unread', function (): void {
    $student = User::factory()->create();
    $student->assignRole('student');
    $mailItem = MailItem::factory()->create(['user_id' => $student->id]);

    UserNotification::query()->create([
        'user_id' => $student->id,
        'mail_item_id' => $mailItem->id,
        'title' => 'One',
        'message' => 'First.',
        'type' => 'received',
        'is_sensitive' => false,
        'is_read' => true,
    ]);

    $response = $this->actingAs($student)->post(route('student.notifications.mark-all-unread'));
    $response->assertRedirect(route('student.notifications.index'));
    $response->assertSessionHas('success');

    expect(UserNotification::query()->where('user_id', $student->id)->where('is_read', false)->count())->toBe(1);
});

test('student can delete all notifications', function (): void {
    $student = User::factory()->create();
    $student->assignRole('student');
    $mailItem = MailItem::factory()->create(['user_id' => $student->id]);

    UserNotification::query()->create([
        'user_id' => $student->id,
        'mail_item_id' => $mailItem->id,
        'title' => 'One',
        'message' => 'First.',
        'type' => 'received',
        'is_sensitive' => false,
        'is_read' => false,
    ]);

    $response = $this->actingAs($student)->delete(route('student.notifications.delete-all'));
    $response->assertRedirect(route('student.notifications.index'));
    $response->assertSessionHas('success');

    expect(UserNotification::query()->where('user_id', $student->id)->count())->toBe(0);
});

test('student can mark single notification as unread', function (): void {
    $student = User::factory()->create();
    $student->assignRole('student');
    $mailItem = MailItem::factory()->create(['user_id' => $student->id]);

    $notification = UserNotification::query()->create([
        'user_id' => $student->id,
        'mail_item_id' => $mailItem->id,
        'title' => 'One',
        'message' => 'First.',
        'type' => 'received',
        'is_sensitive' => false,
        'is_read' => true,
    ]);

    $response = $this->actingAs($student)->post(route('student.notifications.mark-unread', ['id' => $notification->id]));
    $response->assertRedirect();
    $response->assertSessionHas('success');

    $notification->refresh();
    expect($notification->is_read)->toBeFalse();
});
