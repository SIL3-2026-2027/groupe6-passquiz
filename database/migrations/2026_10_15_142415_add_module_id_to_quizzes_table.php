<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Quiz de module (cahier des charges §9) : un module possède au plus un quiz ;
     * un quiz sans module est l'évaluation finale de la formation.
     */
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->index('formation_id');
            $table->dropUnique(['formation_id']);
            $table->foreignId('module_id')->nullable()->unique()->after('formation_id')->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('module_id');
            $table->unique('formation_id');
            $table->dropIndex(['formation_id']);
        });
    }
};
