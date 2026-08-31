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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('facebook_app_account_id');
            $table->string('conversation_id')->index();
            $table->string('participant_id')->nullable()->default(null);
            $table->string('participant_name')->nullable()->default(null);
            $table->string('participant_email')->nullable()->default(null);
            $table->string('snippet')->nullable()->default(null);
            $table->unsignedInteger('unread_count')->default(0);
            $table->unsignedInteger('message_count')->nullable()->default(null);
            $table->string('link', 1000)->nullable()->default(null);
            $table->dateTime('conversation_updated_at')->nullable()->default(null);
            $table->timestamps();

            $table->foreign('facebook_app_account_id')->references('id')->on('facebook_app_accounts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
