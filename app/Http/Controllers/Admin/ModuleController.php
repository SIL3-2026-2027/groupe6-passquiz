<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModuleRequest;
use App\Http\Resources\ModuleResource;
use App\Models\Formation;
use App\Models\Module;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class ModuleController extends Controller
{
    public function index(Formation $formation): AnonymousResourceCollection
    {
        return ModuleResource::collection($formation->modules()->withCount('courses')->get());
    }

    public function store(ModuleRequest $request, Formation $formation): JsonResponse
    {
        $module = $formation->modules()->create($request->validated());

        return (new ModuleResource($module))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Module $module): ModuleResource
    {
        return new ModuleResource($module->load(['formation', 'courses']));
    }

    public function update(ModuleRequest $request, Module $module): ModuleResource
    {
        $module->update($request->validated());

        return new ModuleResource($module);
    }

    public function destroy(Module $module): Response
    {
        $files = $module->courses()->whereNotNull('pdf_path')->pluck('pdf_path')->all();

        $module->delete();

        Storage::disk('public')->delete($files);

        return response()->noContent();
    }
}
