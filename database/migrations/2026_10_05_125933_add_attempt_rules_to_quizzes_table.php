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
        Schema::table('quizzes', function (Blueprint $table) {
            $table->unsignedInteger('retry_delay_minutes')->nullable()->after('max_attempts');
            $table->boolean('requires_course_completion')->default(true)->after('retry_delay_minutes');
            $table->boolean('shuffle_questions')->default(true)->after('requires_course_completion');
            $table->boolean('shuffle_answers')->default(true)->after('shuffle_questions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn(['retry_delay_minutes', 'requires_course_completion', 'shuffle_questions', 'shuffle_answers']);
        });
    }
};
