<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('facebook_app_account_id');
            $table->unsignedBigInteger('user_id');
            $table->string('post_id')->nullable()->default(null);
            $table->boolean('is_published')->default(false);
            $table->boolean('is_scheduled')->default(false);
            $table->dateTime('scheduled_at')->nullable()->default(null);
            $table->string('post_type')->nullable()->default(null)->comment('image, video, text');
            $table->timestamps();
            $table->foreign('facebook_app_account_id')->references('id')->on('facebook_app_accounts')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
