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
use Illuminate\Support\Facades\Storage;

class FormationController extends Controller
{
    /**
     * Liste des formations (filtres : search, is_published).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $formations = Formation::query()
            ->with('quiz')
            ->withCount(['modules', 'courses', 'enrollments', 'certificates'])
            ->when($request->filled('search'), fn (Builder $query) => $query->where('title', 'like', '%'.$request->string('search').'%'))
            ->when($request->has('is_published'), fn (Builder $query) => $query->where('is_published', $request->boolean('is_published')))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return FormationResource::collection($formations);
    }

    public function store(FormationRequest $request): JsonResponse
    {
        $formation = new Formation($request->safe()->except(['image', 'remove_image']));

        if ($request->hasFile('image')) {
            $formation->image_path = $request->file('image')->store('formations', 'public');
        }

        $formation->save();

        return (new FormationResource($formation))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Formation $formation): FormationResource
    {
        $formation->load(['modules.courses', 'quiz' => fn ($query) => $query->withCount('questions')])
            ->loadCount(['modules', 'courses', 'enrollments', 'certificates']);

        return new FormationResource($formation);
    }

    public function update(FormationRequest $request, Formation $formation): FormationResource
    {
        $formation->fill($request->safe()->except(['image', 'remove_image']));

        if ($request->hasFile('image') || $request->boolean('remove_image')) {
            if ($formation->image_path) {
                Storage::disk('public')->delete($formation->image_path);
            }

            $formation->image_path = $request->hasFile('image')
                ? $request->file('image')->store('formations', 'public')
                : null;
        }

        $formation->save();

        return new FormationResource($formation);
    }

    public function destroy(Formation $formation): Response
    {
        $files = $formation->courses()->whereNotNull('pdf_path')->pluck('pdf_path')
            ->push($formation->image_path)
            ->filter()
            ->all();

        $formation->delete();

        Storage::disk('public')->delete($files);

        return response()->noContent();
    }
}
