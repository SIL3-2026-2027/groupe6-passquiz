<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\JsonResponse;

class CertificateVerificationController extends Controller
{
    /**
     * Vérification publique d'un certificat à partir de son numéro (sans authentification).
     *
     * Seules les informations imprimées sur le certificat sont renvoyées.
     */
    public function __invoke(string $number): JsonResponse
    {
        $certificate = Certificate::query()
            ->with(['user:id,name', 'formation:id,title'])
            ->where('number', $number)
            ->first();

        abort_if($certificate === null, 404, 'Aucun certificat ne correspond à ce numéro.');

        return response()->json([
            'data' => [
                'number' => $certificate->number,
                'is_valid' => ! $certificate->isRevoked(),
                'holder_name' => $certificate->user->name,
                'formation_title' => $certificate->formation->title,
                'score' => $certificate->score,
                'issued_at' => $certificate->issued_at,
                'revoked_at' => $certificate->revoked_at,
            ],
        ]);
    }
}
