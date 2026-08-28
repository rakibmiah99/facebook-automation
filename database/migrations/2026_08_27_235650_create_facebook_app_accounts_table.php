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
        Schema::create('facebook_app_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('facebook_app_id');
            $table->unsignedBigInteger('user_id');
            $table->string('account_id');
            $table->string('account_name');
            $table->string('access_token', 1000);
            $table->string('link')->nullable()->default(null);
            $table->integer('fan_count')->nullable()->default(null);
            $table->timestamps();
            $table->foreign('facebook_app_id')->references('id')->on('facebook_apps')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facebook_app_accounts');
    }
};
