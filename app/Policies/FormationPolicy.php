<?php

namespace App\Policies;

use App\Models\Formation;
use App\Models\User;

class FormationPolicy
{
    /**
     * Gestion du contenu, des évaluations et des résultats d'une formation :
     * l'administrateur gère tout, le formateur uniquement ses propres formations.
     */
    public function manage(User $user, Formation $formation): bool
    {
        return $user->isAdmin() || ($user->isTrainer() && $formation->trainer_id === $user->id);
    }

    /**
     * Seul l'administrateur valide et publie les formations.
     */
    public function publish(User $user, Formation $formation): bool
    {
        return $user->isAdmin();
    }
}
