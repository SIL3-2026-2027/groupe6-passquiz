<?php

namespace App\Http\Resources;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Certificate
 */
class CertificateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'score' => $this->score,
            'issued_at' => $this->issued_at,
            'is_revoked' => $this->isRevoked(),
            'revoked_at' => $this->revoked_at,
            'revocation_reason' => $this->revocation_reason,
            'verification_url' => $this->number ? url("/verify/{$this->number}") : null,
            'download_url' => $request->routeIs('admin.*')
                ? route('admin.certificates.download', $this->resource)
                : route('certificates.download', $this->resource),
            'user' => new UserResource($this->whenLoaded('user')),
            'formation' => new FormationResource($this->whenLoaded('formation')),
            'attempt' => new QuizAttemptResource($this->whenLoaded('attempt')),
        ];
    }
}
