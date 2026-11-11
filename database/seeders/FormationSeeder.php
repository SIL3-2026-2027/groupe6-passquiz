<?php

namespace Database\Seeders;

use App\Enums\FormationLevel;
use App\Enums\QuestionType;
use App\Enums\UserRole;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FormationSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Formation Laravel décrite dans le cahier des charges (contenu provisoire),
     * confiée au compte formateur de démonstration. La formation React est créée par ReactFormationSeeder.
     */
    public function run(): void
    {
        $trainer = User::where('role', UserRole::Trainer)->oldest('id')->first();

        foreach ($this->formations() as $data) {
            $formation = Formation::create([
                'trainer_id' => $trainer?->id,
                'title' => $data['title'],
                'slug' => $data['slug'],
                'code' => $data['code'],
                'description' => $data['description'],
                'level' => FormationLevel::Beginner,
                'is_published' => true,
            ]);

            foreach ($data['modules'] as $index => $moduleTitle) {
                $module = $formation->modules()->create([
                    'number' => $index + 1,
                    'title' => $moduleTitle,
                    'description' => "Module {$moduleTitle} de la formation {$data['title']}.",
                ]);

                $module->courses()->create([
                    'title' => $moduleTitle,
                    'description' => "Les notions essentielles : {$moduleTitle}.",
                    'content' => "Contenu du cours « {$moduleTitle} ». À compléter depuis l'interface d'administration.",
                    'duration_minutes' => 20,
                    'position' => 1,
                ]);
            }

            $quiz = $formation->quiz()->create([
                'title' => "Évaluation finale {$data['title']}",
                'description' => "Évaluation finale de la formation {$data['title']}.",
                'passing_score' => 70,
                'time_limit_minutes' => 30,
                'max_attempts' => 3,
                'retry_delay_minutes' => 60,
                'is_published' => true,
            ]);

            foreach ($data['questions'] as $position => $question) {
                $created = $quiz->questions()->create([
                    'text' => $question['text'],
                    'type' => $question['type'] ?? (count(array_filter($question['answers'])) > 1 ? QuestionType::Multiple : QuestionType::Single),
                    'points' => 1,
                    'position' => $position + 1,
                ]);

                $answerPosition = 1;

                foreach ($question['answers'] as $text => $isCorrect) {
                    $created->answers()->create([
                        'text' => $text,
                        'is_correct' => $isCorrect,
                        'position' => $answerPosition++,
                    ]);
                }
            }
        }
    }

    /**
     * @return array<int, array{title: string, slug: string, code: string, description: string, modules: array<int, string>, questions: array<int, array{text: string, type?: QuestionType, answers: array<string, bool>}>}>
     */
    private function formations(): array
    {
        return [
            [
                'title' => 'Laravel',
                'slug' => 'laravel',
                'code' => 'LAR',
                'description' => 'Apprenez à développer des applications web modernes avec le framework PHP Laravel.',
                'modules' => ['Introduction à Laravel', 'Installation', 'Routes', 'Controllers', 'Models', 'Migrations', 'Eloquent ORM'],
                'questions' => [
                    ['text' => 'Quel outil en ligne de commande est fourni avec Laravel ?', 'answers' => ['Artisan' => true, 'Composer' => false, 'npm' => false, 'Webpack' => false]],
                    ['text' => 'Dans quel fichier déclare-t-on les routes web ?', 'answers' => ['routes/web.php' => true, 'app/routes.php' => false, 'config/routes.php' => false]],
                    ['text' => 'Quelle commande crée un contrôleur ?', 'answers' => ['php artisan make:controller' => true, 'php artisan new:controller' => false, 'composer make:controller' => false]],
                    ['text' => 'Quel est l\'ORM de Laravel ?', 'answers' => ['Eloquent' => true, 'Doctrine' => false, 'Hibernate' => false]],
                    ['text' => 'Quelle commande exécute les migrations ?', 'answers' => ['php artisan migrate' => true, 'php artisan db:run' => false, 'php artisan schema:up' => false]],
                    ['text' => 'Les migrations permettent de versionner la structure de la base de données.', 'type' => QuestionType::TrueFalse, 'answers' => ['Vrai' => true, 'Faux' => false]],
                    ['text' => 'Quelles relations Eloquent existent ?', 'answers' => ['hasMany' => true, 'belongsTo' => true, 'linkedTo' => false, 'belongsToMany' => true]],
                ],
            ],
        ];
    }
}
