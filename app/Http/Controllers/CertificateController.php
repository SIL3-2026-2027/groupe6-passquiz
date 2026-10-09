<?php

namespace App\Http\Controllers;

use App\Http\Resources\CertificateResource;
use App\Models\Certificate;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class CertificateController extends Controller
{
    public function __construct(private CertificateService $certificates) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return CertificateResource::collection(
            $request->user()->certificates()->whereNull('revoked_at')->with('formation')->latest('issued_at')->get()
        );
    }

    public function download(Certificate $certificate): Response
    {
        Gate::authorize('download', $certificate);

        return $this->certificates->pdf($certificate)->download($this->certificates->fileName($certificate));
    }
}
