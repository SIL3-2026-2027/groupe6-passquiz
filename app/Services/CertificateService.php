<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Formation;
use App\Models\QuizAttempt;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as PdfDocument;

class CertificateService
{
    /**
     * Délivre le certificat suite à une tentative réussie (un seul certificat par formation et par apprenant).
     */
    public function issueForAttempt(QuizAttempt $attempt): Certificate
    {
        return $this->issue($attempt->user, $attempt->quiz->formation, $attempt->score, $attempt);
    }

    public function issue(User $user, Formation $formation, int $score, ?QuizAttempt $attempt = null): Certificate
    {
        return Certificate::firstOrCreate(
            ['user_id' => $user->id, 'formation_id' => $formation->id],
            ['quiz_attempt_id' => $attempt?->id, 'score' => $score, 'issued_at' => now()],
        );
    }

    public function pdf(Certificate $certificate): PdfDocument
    {
        $certificate->loadMissing(['user', 'formation']);

        return Pdf::loadView('certificates.pdf', [
            'certificate' => $certificate,
            'issuedOn' => $certificate->issued_at->locale('fr')->translatedFormat('j F Y'),
        ])->setPaper('a4', 'landscape');
    }

    public function fileName(Certificate $certificate): string
    {
        return "certificat-{$certificate->number}.pdf";
    }
}
