<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MailItemController as AdminMailItemController;
use App\Http\Controllers\Admin\ReceiveMailController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\MailItemController as StudentMailItemController;
use App\Http\Controllers\Student\NotificationController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Spatie\Permission\Models\Role;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    $user = request()->user();

    if ($user->hasRole('admin')) {
        return redirect()->route('admin.dashboard');
    }

    if (! $user->hasRole('student')) {
        $user->assignRole(Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']));
    }

    return redirect()->route('student.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.dashboard');

Route::get('admin/students', function () {
    $students = User::query()
        ->role('student')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'student_id' => $user->student_id,
            'phone' => $user->phone,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'created_at' => $user->created_at->toIso8601String(),
        ]);

    return Inertia::render('admin/students/index', [
        'students' => $students,
    ]);
})->middleware(['auth', 'verified', 'role:admin'])->name('admin.students');

Route::get('admin/students/lookup', function (Request $request) {
    $request->validate(['student_id' => ['required', 'string', 'digits:7']]);
    $user = User::query()
        ->role('student')
        ->where('student_id', $request->input('student_id'))
        ->first();
    if (! $user) {
        return response()->json(['message' => 'Student not found'], 404);
    }

    return response()->json(['id' => $user->id, 'name' => $user->name]);
})->middleware(['auth', 'verified', 'role:admin'])->name('admin.students.lookup');

Route::get('admin/receive-mail', [ReceiveMailController::class, 'create'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.receive-mail');

Route::post('admin/receive-mail', [ReceiveMailController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.receive-mail.store');

Route::get('admin/pickup-desk', [AdminMailItemController::class, 'pickupDesk'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.pickup-desk');

Route::patch('admin/mail-items/{id}/picked-up', [AdminMailItemController::class, 'markPickedUp'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.mail-items.mark-picked-up');

Route::post('admin/mail-items/{id}/send-reminder', [AdminMailItemController::class, 'sendReminder'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.mail-items.send-reminder');

Route::get('student/dashboard', [StudentDashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('student.dashboard');

Route::get('student/notifications', [NotificationController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('student.notifications.index');

Route::get('student/notifications/{id}', [NotificationController::class, 'show'])
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('student.notifications.show');

Route::post('student/notifications/{id}/read', [NotificationController::class, 'markRead'])
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('student.notifications.mark-read');

Route::post('student/notifications/{id}/unread', [NotificationController::class, 'markUnread'])
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('student.notifications.mark-unread');

Route::post('student/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('student.notifications.mark-all-read');

Route::post('student/notifications/mark-all-unread', [NotificationController::class, 'markAllUnread'])
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('student.notifications.mark-all-unread');

Route::delete('student/notifications/delete-all', [NotificationController::class, 'deleteAll'])
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('student.notifications.delete-all');

Route::get('student/mail-items/{id}', [StudentMailItemController::class, 'show'])
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('student.mail-items.show');

require __DIR__.'/settings.php';
