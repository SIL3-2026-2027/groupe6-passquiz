<?php

namespace App\Models;

use Database\Factories\CertificateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Fillable(['user_id', 'formation_id', 'quiz_attempt_id', 'score', 'issued_at', 'revoked_at', 'revocation_reason'])]
class Certificate extends Model
{
    /** @use HasFactory<CertificateFactory> */
    use HasFactory;

    /**
     * Génère le numéro du certificat (ex : PQ-LAR-2026-00001) une fois l'identifiant connu.
     */
    protected static function booted(): void
    {
        static::created(function (Certificate $certificate): void {
            $certificate->number = sprintf(
                'PQ-%s-%s-%05d',
                Str::upper($certificate->formation->code),
                $certificate->issued_at->format('Y'),
                $certificate->id,
            );
            $certificate->saveQuietly();
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'issued_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Formation, $this>
     */
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    /**
     * @return BelongsTo<QuizAttempt, $this>
     */
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }
}
