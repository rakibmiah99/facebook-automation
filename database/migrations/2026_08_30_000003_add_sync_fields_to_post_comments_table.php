<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('post_comments', function (Blueprint $table) {
            $table->string('commenter_id')->nullable()->default(null)->after('comment_id');
            $table->string('commenter_name')->nullable()->default(null)->after('commenter_id');
            $table->string('source_url', 2000)->nullable()->default(null)->after('attachment_path');
            $table->dateTime('commented_at')->nullable()->default(null)->after('source_url');
        });
    }

    public function down(): void
    {
        Schema::table('post_comments', function (Blueprint $table) {
            $table->dropColumn(['commenter_id', 'commenter_name', 'source_url', 'commented_at']);
        });
    }
};
