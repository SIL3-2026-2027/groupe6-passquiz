<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs (filtres : search, role, is_active).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::query()
            ->withCount(['enrollments', 'certificates', 'quizAttempts'])
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = '%'.$request->string('search').'%';
                $query->where(fn ($query) => $query->where('name', 'like', $search)->orWhere('email', 'like', $search));
            })
            ->when($request->filled('role'), fn ($query) => $query->where('role', $request->string('role')))
            ->when($request->has('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return UserResource::collection($users);
    }

    public function store(UserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());
        $user->markEmailAsVerified();

        return (new UserResource($user))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(User $user): UserResource
    {
        $user->loadCount(['enrollments', 'certificates', 'quizAttempts']);

        return new UserResource($user);
    }

    /**
     * @throws ValidationException
     */
    public function update(UserRequest $request, User $user): UserResource
    {
        $data = $request->validated();

        if ($request->user()->is($user) && ($data['role'] !== $user->role->value || ($request->has('is_active') && ! $request->boolean('is_active')))) {
            throw ValidationException::withMessages(['role' => 'Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte.']);
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        if (! $user->is_active) {
            $user->tokens()->delete();
        }

        return new UserResource($user);
    }

    /**
     * @throws ValidationException
     */
    public function destroy(Request $request, User $user): Response
    {
        if ($request->user()->is($user)) {
            throw ValidationException::withMessages(['user' => 'Vous ne pouvez pas supprimer votre propre compte.']);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }
}
