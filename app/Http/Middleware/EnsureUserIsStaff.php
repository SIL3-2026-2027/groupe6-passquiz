<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsStaff
{
    /**
     * Réserve l'accès aux administrateurs et aux formateurs.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->isStaff(), Response::HTTP_FORBIDDEN, 'Accès réservé aux formateurs et administrateurs.');

        return $next($request);
    }
}
