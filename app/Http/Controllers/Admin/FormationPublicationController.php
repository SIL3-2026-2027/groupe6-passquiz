<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormationResource;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class FormationPublicationController extends Controller
{
    /**
     * Valide et publie une formation (ou la repasse en brouillon).
     */
    public function __invoke(Request $request, Formation $formation): FormationResource
    {
        Gate::authorize('publish', $formation);

        $validated = $request->validate(['is_published' => ['required', 'boolean']]);

        $formation->update($validated);

        return new FormationResource($formation->load('trainer'));
    }
}
