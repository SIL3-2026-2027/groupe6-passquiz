<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CertificateVerificationController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuizAttemptController;
use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentification
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->name('auth.')->group(function () {
    Route::middleware('throttle:6,1')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->name('register');
        Route::post('login', [AuthController::class, 'login'])->name('login');
        Route::post('forgot-password', [PasswordResetController::class, 'sendResetLink'])->name('password.email');
        Route::post('reset-password', [PasswordResetController::class, 'reset'])->name('password.reset');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('me', [AuthController::class, 'me'])->name('me');
    });
});

/*
|--------------------------------------------------------------------------
| Vérification publique des certificats
|--------------------------------------------------------------------------
*/

Route::get('certificates/verify/{number}', CertificateVerificationController::class)
    ->middleware('throttle:30,1')
    ->name('certificates.verify');

/*
|--------------------------------------------------------------------------
| Espace apprenant
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    Route::get('formations', [FormationController::class, 'index'])->name('formations.index');
    Route::get('formations/{formation}', [FormationController::class, 'show'])->name('formations.show');
    Route::post('formations/{formation}/enroll', [EnrollmentController::class, 'store'])->name('formations.enroll');

    Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    Route::post('courses/{course}/complete', [CourseController::class, 'complete'])->name('courses.complete');

    Route::get('quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');
    Route::post('quizzes/{quiz}/attempts', [QuizAttemptController::class, 'store'])->name('quizzes.attempts.store');

    Route::get('attempts', [QuizAttemptController::class, 'index'])->name('attempts.index');
    Route::get('attempts/{attempt}', [QuizAttemptController::class, 'show'])->name('attempts.show');
    Route::post('attempts/{attempt}/submit', [QuizAttemptController::class, 'submit'])->name('attempts.submit');

    Route::get('certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::get('certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');
});

/*
|--------------------------------------------------------------------------
| Administration
|--------------------------------------------------------------------------
|
| Formateurs et administrateurs : contenu pédagogique, évaluations et résultats.
| Un formateur ne gère que ses propres formations (FormationPolicy::manage).
| Administrateurs uniquement : validation/publication des formations, utilisateurs,
| certificats, suppression de tentatives.
*/

Route::middleware(['auth:sanctum', 'staff'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', Admin\DashboardController::class)->name('dashboard');
    Route::get('statistics', Admin\StatisticsController::class)->name('statistics');

    Route::apiResource('formations', Admin\FormationController::class);
    Route::get('formations/{formation}/learners', Admin\FormationLearnerController::class)->name('formations.learners');
    Route::put('formations/{formation}/publication', Admin\FormationPublicationController::class)->name('formations.publication');
    Route::get('users/{user}/progress', Admin\UserProgressController::class)->name('users.progress');
    Route::apiResource('formations.modules', Admin\ModuleController::class)->shallow();
    Route::apiResource('modules.courses', Admin\CourseController::class)->shallow();

    Route::apiResource('quizzes', Admin\QuizController::class);
    Route::apiResource('quizzes.questions', Admin\QuestionController::class)->shallow();
    Route::apiResource('questions.answers', Admin\AnswerController::class)->shallow()->except('show');

    Route::get('attempts', [Admin\QuizAttemptController::class, 'index'])->name('attempts.index');
    Route::get('attempts/{attempt}', [Admin\QuizAttemptController::class, 'show'])->name('attempts.show');

    Route::middleware('admin')->group(function () {
        Route::apiResource('users', Admin\UserController::class);

        Route::delete('attempts/{attempt}', [Admin\QuizAttemptController::class, 'destroy'])->name('attempts.destroy');

        Route::apiResource('certificates', Admin\CertificateController::class)->except('update');
        Route::get('certificates/{certificate}/download', [Admin\CertificateController::class, 'download'])->name('certificates.download');
        Route::post('certificates/{certificate}/revoke', [Admin\CertificateController::class, 'revoke'])->name('certificates.revoke');
        Route::post('certificates/{certificate}/restore', [Admin\CertificateController::class, 'restore'])->name('certificates.restore');
    });
});
