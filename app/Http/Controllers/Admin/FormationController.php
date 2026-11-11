<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FormationRequest;
use App\Http\Resources\FormationResource;
use App\Models\Formation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class FormationController extends Controller
{
    /**
     * Liste des formations gérées par l'utilisateur (filtres : search, is_published, trainer_id).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $formations = Formation::query()
            ->managedBy($request->user())
            ->with(['quiz', 'trainer'])
            ->withCount(['modules', 'courses', 'enrollments', 'certificates'])
            ->when($request->filled('search'), fn (Builder $query) => $query->where('title', 'like', '%'.$request->string('search').'%'))
            ->when($request->has('is_published'), fn (Builder $query) => $query->where('is_published', $request->boolean('is_published')))
            ->when($request->filled('trainer_id'), fn (Builder $query) => $query->where('trainer_id', $request->integer('trainer_id')))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return FormationResource::collection($formations);
    }

    /**
     * Une formation créée par un formateur lui est attribuée et reste en brouillon
     * jusqu'à sa validation par un administrateur.
     */
    public function store(FormationRequest $request): JsonResponse
    {
        $formation = new Formation($request->formationAttributes());

        if ($request->user()->isTrainer()) {
            $formation->trainer_id = $request->user()->id;
            $formation->is_published = false;
        }

        if ($request->hasFile('image')) {
            $formation->image_path = $request->file('image')->store('formations', 'public');
        }

        $formation->save();

        return (new FormationResource($formation->load('trainer')))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Formation $formation): FormationResource
    {
        Gate::authorize('manage', $formation);

        $formation->load([
            'trainer',
            'modules.courses',
            'modules.quiz' => fn ($query) => $query->withCount('questions'),
            'quiz' => fn ($query) => $query->withCount('questions'),
        ])
            ->loadCount(['modules', 'courses', 'enrollments', 'certificates']);

        return new FormationResource($formation);
    }

    public function update(FormationRequest $request, Formation $formation): FormationResource
    {
        Gate::authorize('manage', $formation);

        $formation->fill($request->formationAttributes());

        if ($request->hasFile('image') || $request->boolean('remove_image')) {
            if ($formation->image_path) {
                Storage::disk('public')->delete($formation->image_path);
            }

            $formation->image_path = $request->hasFile('image')
                ? $request->file('image')->store('formations', 'public')
                : null;
        }

        $formation->save();

        return new FormationResource($formation->load('trainer'));
    }

    public function destroy(Formation $formation): Response
    {
        Gate::authorize('manage', $formation);

        $files = $formation->courses()->whereNotNull('pdf_path')->pluck('pdf_path')
            ->push($formation->image_path)
            ->filter()
            ->all();

        $formation->delete();

        Storage::disk('public')->delete($files);

        return response()->noContent();
    }
}
