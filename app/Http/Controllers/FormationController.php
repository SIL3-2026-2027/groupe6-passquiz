<?php

namespace App\Http\Controllers;

use App\Http\Resources\FormationResource;
use App\Models\Formation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class FormationController extends Controller
{
    /**
     * Catalogue des formations publiées, avec la progression de l'utilisateur.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $formations = Formation::query()
            ->published()
            ->withProgressFor($user)
            ->withCount('modules')
            ->withExists(['enrollments as is_enrolled' => fn (Builder $query) => $query->whereBelongsTo($user)])
            ->orderBy('title')
            ->get();

        return FormationResource::collection($formations);
    }

    /**
     * Détail d'une formation : modules, cours (terminés ou non) et évaluation.
     */
    public function show(Request $request, Formation $formation): FormationResource
    {
        abort_unless($formation->is_published, Response::HTTP_NOT_FOUND);

        $user = $request->user();

        $formation = Formation::query()
            ->withProgressFor($user)
            ->withCount('modules')
            ->withExists(['enrollments as is_enrolled' => fn (Builder $query) => $query->whereBelongsTo($user)])
            ->with([
                'modules.courses' => fn ($query) => $query->withExists([
                    'completedBy as is_completed' => fn (Builder $users) => $users->whereKey($user->id),
                ]),
                'quiz' => fn ($query) => $query->where('is_published', true)->withCount('questions'),
            ])
            ->findOrFail($formation->id);

        return new FormationResource($formation);
    }
}
