<?php

namespace Database\Seeders;

class LaravelFormationSeeder extends FormationContentSeeder
{
    /**
     * Formation Laravel : 12 modules et évaluation finale, à partir des fiches de
     * data/laravel/fiches (une fiche cours et une fiche questions par module).
     */
    protected function formation(): array
    {
        return [
            'slug' => 'laravel',
            'title' => 'Laravel',
            'code' => 'LAR',
            'description' => 'Apprenez à développer des applications web modernes avec le framework PHP Laravel : MVC, routes, controllers, Blade, base de données et Eloquent, formulaires, CRUD, authentification, middleware et autorisations.',
        ];
    }
}
