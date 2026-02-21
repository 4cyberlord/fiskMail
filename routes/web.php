<?php

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

Route::get('admin/dashboard', function () {
    return Inertia::render('admin/dashboard');
})->middleware(['auth', 'verified', 'role:admin'])->name('admin.dashboard');

Route::get('student/dashboard', function () {
    return Inertia::render('student/dashboard');
})->middleware(['auth', 'verified', 'role:student'])->name('student.dashboard');

require __DIR__.'/settings.php';
