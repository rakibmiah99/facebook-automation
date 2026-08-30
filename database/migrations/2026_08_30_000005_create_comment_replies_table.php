<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comment_replies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('post_comment_id');
            $table->string('reply_id')->nullable()->default(null);
            $table->text('message');
            $table->boolean('is_automatic')->default(false);
            $table->timestamps();
            $table->foreign('post_comment_id')->references('id')->on('post_comments')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_replies');
    }
};
