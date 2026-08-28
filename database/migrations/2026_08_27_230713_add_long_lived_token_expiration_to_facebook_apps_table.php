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
        Schema::table('facebook_apps', function (Blueprint $table) {
            $table->integer('long_lived_token_expiration')->nullable()->default(null)->after('long_lived_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('facebook_apps', function (Blueprint $table) {
            $table->dropColumn('long_lived_token_expiration');
        });
    }
};
