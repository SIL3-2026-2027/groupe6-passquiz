<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Gate;

class NotificationController extends Controller
{
    /**
     * Dernières notifications de l'utilisateur et nombre de non lues (cloche).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => $user->notifications()->limit(20)->get()->map(fn (DatabaseNotification $notification): array => [
                'id' => $notification->id,
                ...$notification->data,
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
            ]),
            'meta' => ['unread_count' => $user->unreadNotifications()->count()],
        ]);
    }

    public function markAsRead(Request $request, DatabaseNotification $notification): JsonResponse
    {
        Gate::allowIf($notification->notifiable()->is($request->user()));

        $notification->markAsRead();

        return response()->json(['meta' => ['unread_count' => $request->user()->unreadNotifications()->count()]]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['meta' => ['unread_count' => 0]]);
    }
}
