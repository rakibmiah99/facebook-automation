<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('permalink_url')->nullable()->default(null)->after('post_id');
            $table->dateTime('published_at')->nullable()->default(null)->after('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['permalink_url', 'published_at']);
        });
    }
};
