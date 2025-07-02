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
        Schema::create('barkada_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_code', 10)->unique();
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('max_participants')->nullable();
            $table->json('current_track')->nullable();
            $table->json('playback_state')->nullable();
            $table->json('sync_data')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            
            $table->index(['session_code', 'is_active']);
            $table->index(['creator_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barkada_sessions');
    }
};
