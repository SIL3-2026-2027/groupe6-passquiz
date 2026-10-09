<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function index(Module $module): AnonymousResourceCollection
    {
        return CourseResource::collection($module->courses);
    }

    public function store(CourseRequest $request, Module $module): JsonResponse
    {
        $course = $module->courses()->make($request->safe()->except(['pdf', 'remove_pdf']));

        if ($request->hasFile('pdf')) {
            $course->pdf_path = $request->file('pdf')->store('courses', 'public');
        }

        $course->save();

        return (new CourseResource($course))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Course $course): CourseResource
    {
        return new CourseResource($course->load('module.formation'));
    }

    public function update(CourseRequest $request, Course $course): CourseResource
    {
        $course->fill($request->safe()->except(['pdf', 'remove_pdf']));

        if ($request->hasFile('pdf') || $request->boolean('remove_pdf')) {
            if ($course->pdf_path) {
                Storage::disk('public')->delete($course->pdf_path);
            }

            $course->pdf_path = $request->hasFile('pdf')
                ? $request->file('pdf')->store('courses', 'public')
                : null;
        }

        $course->save();

        return new CourseResource($course);
    }

    public function destroy(Course $course): Response
    {
        if ($course->pdf_path) {
            Storage::disk('public')->delete($course->pdf_path);
        }

        $course->delete();

        return response()->noContent();
    }
}
