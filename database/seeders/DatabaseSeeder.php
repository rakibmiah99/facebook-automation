<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'rakibmiah120199@gmail.com',
            'password' => bcrypt('123456'),
        ]);

        Artisan::call('user:make-admin {email}', ['email' => 'rakibmiah120199@gmail.com']);
    }
}
