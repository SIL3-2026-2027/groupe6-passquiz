<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RevokeCertificateRequest;
use App\Http\Requests\Admin\StoreCertificateRequest;
use App\Http\Resources\CertificateResource;
use App\Models\Certificate;
use App\Models\Formation;
use App\Models\User;
use App\Services\CertificateService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CertificateController extends Controller
{
    public function __construct(private CertificateService $certificates) {}

    /**
     * Liste des certificats (filtres : search, user_id, formation_id, status = valid|revoked).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $certificates = Certificate::query()
            ->with(['user', 'formation'])
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = '%'.$request->string('search').'%';
                $query->where(fn (Builder $query) => $query
                    ->where('number', 'like', $search)
                    ->orWhereRelation('user', 'name', 'like', $search)
                    ->orWhereRelation('user', 'email', 'like', $search));
            })
            ->when($request->filled('user_id'), fn (Builder $query) => $query->where('user_id', $request->integer('user_id')))
            ->when($request->filled('formation_id'), fn (Builder $query) => $query->where('formation_id', $request->integer('formation_id')))
            ->when($request->string('status')->toString(), fn (Builder $query, string $status) => match ($status) {
                'valid' => $query->whereNull('revoked_at'),
                'revoked' => $query->whereNotNull('revoked_at'),
                default => $query,
            })
            ->latest('issued_at')
            ->paginate($request->integer('per_page', 15));

        return CertificateResource::collection($certificates);
    }

    /**
     * Délivre manuellement un certificat.
     */
    public function store(StoreCertificateRequest $request): JsonResponse
    {
        $certificate = $this->certificates->issue(
            User::findOrFail($request->integer('user_id')),
            Formation::findOrFail($request->integer('formation_id')),
            $request->integer('score'),
        );

        return (new CertificateResource($certificate->refresh()->load(['user', 'formation'])))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Certificate $certificate): CertificateResource
    {
        return new CertificateResource($certificate->load(['user', 'formation', 'attempt']));
    }

    public function download(Certificate $certificate): Response
    {
        return $this->certificates->pdf($certificate)->download($this->certificates->fileName($certificate));
    }

    public function revoke(RevokeCertificateRequest $request, Certificate $certificate): CertificateResource
    {
        $certificate->update([
            'revoked_at' => now(),
            'revocation_reason' => $request->validated('reason'),
        ]);

        return new CertificateResource($certificate->load(['user', 'formation']));
    }

    public function restore(Certificate $certificate): CertificateResource
    {
        $certificate->update(['revoked_at' => null, 'revocation_reason' => null]);

        return new CertificateResource($certificate->load(['user', 'formation']));
    }

    public function destroy(Certificate $certificate): Response
    {
        $certificate->delete();

        return response()->noContent();
    }
}
