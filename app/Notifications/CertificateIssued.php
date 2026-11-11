<?php

namespace App\Notifications;

use App\Models\Certificate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Prévient l'apprenant qu'un administrateur lui a délivré (ou rendu) un certificat.
 */
class CertificateIssued extends Notification
{
    use Queueable;

    public function __construct(public Certificate $certificate) {}

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
        $this->certificate->loadMissing('formation');

        return [
            'title' => 'Certificat délivré',
            'message' => "Votre certificat de la formation {$this->certificate->formation->title} est disponible (n° {$this->certificate->number}).",
            'url' => '/certificates',
        ];
    }
}
