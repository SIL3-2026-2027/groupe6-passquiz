<?php

namespace App\Notifications;

use App\Models\Course;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Prévient l'équipe (administrateurs et formateur de la formation) qu'un apprenant a terminé un cours.
 */
class CourseCompleted extends Notification
{
    use Queueable;

    public function __construct(public User $learner, public Course $course) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array{title: string, message: string, url: string}
     */
    public function toArray(object $notifiable): array
    {
        $this->course->loadMissing('module.formation');
        $module = $this->course->module;

        return [
            'title' => 'Cours terminé',
            'message' => "{$this->learner->name} a terminé le cours « {$this->course->title} » (formation {$module->formation->title}, module {$module->number}).",
            'url' => "/admin/users/{$this->learner->id}",
        ];
    }
}
