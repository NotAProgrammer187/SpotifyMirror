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
        Schema::table('users', function (Blueprint $table) {
            // Add spotify_id column if it doesn't exist
            if (!Schema::hasColumn('users', 'spotify_id')) {
                $table->string('spotify_id')->unique()->after('email');
            }
            
            // Add avatar_url column if it doesn't exist
            if (!Schema::hasColumn('users', 'avatar_url')) {
                $table->string('avatar_url')->nullable()->after('spotify_id');
            }
            
            // Add spotify_data column if it doesn't exist
            if (!Schema::hasColumn('users', 'spotify_data')) {
                $table->json('spotify_data')->nullable()->after('avatar_url');
            }
            
            // Make email nullable since Spotify users might not have public email
            $table->string('email')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove the columns we added
            if (Schema::hasColumn('users', 'spotify_id')) {
                $table->dropColumn('spotify_id');
            }
            
            if (Schema::hasColumn('users', 'avatar_url')) {
                $table->dropColumn('avatar_url');
            }
            
            if (Schema::hasColumn('users', 'spotify_data')) {
                $table->dropColumn('spotify_data');
            }
            
            // Make email required again
            $table->string('email')->nullable(false)->change();
        });
    }
};
