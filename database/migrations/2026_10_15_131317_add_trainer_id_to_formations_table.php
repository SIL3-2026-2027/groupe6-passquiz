<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Formateur responsable de la formation (null : formation gérée par l'administration).
     */
    public function up(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            $table->foreignId('trainer_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('trainer_id');
        });
    }
};
