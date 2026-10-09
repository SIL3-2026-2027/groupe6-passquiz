<?php

namespace App\Enums;

enum QuestionType: string
{
    /** Une seule bonne réponse. */
    case Single = 'single';

    /** Plusieurs bonnes réponses possibles. */
    case Multiple = 'multiple';

    /** Deux réponses (Vrai / Faux), une seule est correcte. */
    case TrueFalse = 'true_false';

    /**
     * Le type n'accepte qu'une réponse sélectionnée.
     */
    public function hasSingleAnswer(): bool
    {
        return $this !== self::Multiple;
    }
}
