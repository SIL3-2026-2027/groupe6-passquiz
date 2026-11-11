<?php

namespace Database\Seeders;

class ReactFormationSeeder extends FormationContentSeeder
{
    /**
     * Formation React : 8 modules et évaluation finale (fiches de l'équipe).
     */
    protected function formation(): array
    {
        return [
            'slug' => 'react',
            'title' => 'React',
            'code' => 'REA',
            'description' => 'Maîtrisez la bibliothèque JavaScript React pour construire des interfaces utilisateur : composants, state, hooks, React Router, formulaires, appels API, tests et déploiement.',
        ];
    }
}
