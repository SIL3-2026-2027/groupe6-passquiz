<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';

    /** Gère le contenu pédagogique (formations, cours, évaluations) et consulte les résultats. */
    case Trainer = 'trainer';

    case Learner = 'learner';
}
