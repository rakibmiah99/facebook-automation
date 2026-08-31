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
        Schema::create('conversation_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('conversation_id');
            $table->string('message_id')->nullable()->default(null)->index();
            $table->boolean('is_from_page')->default(false);
            $table->string('sender_id')->nullable()->default(null);
            $table->string('sender_name')->nullable()->default(null);
            $table->text('message')->nullable()->default(null);
            $table->string('attachment_path', 1000)->nullable()->default(null);
            $table->string('attachment_source_url', 2000)->nullable()->default(null);
            $table->string('attachment_type')->nullable()->default(null);
            $table->dateTime('sent_at')->nullable()->default(null);
            $table->timestamps();

            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversation_messages');
    }
};
