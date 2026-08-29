<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_template_request_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_template_request_id')
                ->constrained(indexName: 'ctr_attachments_ctr_id_foreign')
                ->cascadeOnDelete();
            $table->string('path', 1000);
            $table->string('original_filename');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_template_request_attachments');
    }
};
