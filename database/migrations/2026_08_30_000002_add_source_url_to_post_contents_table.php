<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('post_contents', function (Blueprint $table) {
            $table->string('source_url', 2000)->nullable()->default(null)->after('content_path');
        });
    }

    public function down(): void
    {
        Schema::table('post_contents', function (Blueprint $table) {
            $table->dropColumn('source_url');
        });
    }
};
