<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('aspect_ratio')->comment('1:1, 4:5, 9:16, 16:9, ...');
            $table->unsignedInteger('width');
            $table->unsignedInteger('height');
            $table->string('preview_path')->nullable();
            $table->json('config');
            $table->boolean('is_common')->default(false)->comment('Available to every user when true');
            $table->boolean('is_premium')->default(false)->comment('Extension point for future billing; not enforced yet');
            $table->boolean('is_active')->default(true);

            // Ownership: the single user this private/custom template is assigned to. Null for common templates.
            $table->foreignId('owner_id')->nullable()->constrained('users')->cascadeOnDelete();

            // Provenance: who built the template definition (admin/team), independent of who owns/uses it.
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            // Traceability back to the request that led to this template, if any.
            $table->foreignId('custom_template_request_id')->nullable()->constrained()->nullOnDelete();

            $table->timestamps();

            $table->index(['is_common', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
