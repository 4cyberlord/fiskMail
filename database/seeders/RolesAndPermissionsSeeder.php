<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'student', 'guard_name' => 'web']);

        $admin = User::firstOrCreate(
            ['email' => 'cboakye12@my.fisk.edu'],
            [
                'name' => 'Admin',
                'password' => Hash::make('placeholder'),
                'email_verified_at' => now(),
            ]
        );

        if (! $admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }
    }
}
