# Fiche de saisie — Bases de données et migrations
> Formation **Laravel**. Retranscrit depuis **Laravel_Module_05_Migrations_Cours.pdf** (PDF du cours à joindre) · Questions et corrigé : **Laravel_Module_05_Migrations_Questions.pdf**.

## Module

| Champ | Valeur |
|---|---|
| Ordre | 5 |
| Titre | Bases de données et migrations |
| Description | Décrire ses tables en PHP, les créer, les modifier et les remplir. |

## Cours 1 — Configuration et connexion MySQL

| Champ | Valeur |
|---|---|
| Titre | Configuration et connexion MySQL |
| Description | Laravel doit savoir à quelle base se connecter. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_05_Migrations_Cours.pdf (à joindre au cours 1 ; ou à chaque cours) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Configurer la connexion

- Les paramètres de la base sont dans le fichier d'environnement `.env`
- XAMPP : `root` sans mot de passe par défaut

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=blog
DB_USERNAME=root
DB_PASSWORD=
```

### Tester

- Si la connexion échoue, `migrate` affiche l'erreur
- Base absente → message « Unknown database »

```bash
# 1. Créer la base « blog » (phpMyAdmin)
# 2. Lancer les migrations
php artisan migrate

# Voir l'état des migrations
php artisan migrate:status
```

---

## Cours 2 — Créer une migration

| Champ | Valeur |
|---|---|
| Titre | Créer une migration |
| Description | La structure de la base, versionnée avec le code. |
| Durée estimée (minutes) | 25 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_05_Migrations_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Pourquoi des migrations ?

- Une **migration** est un fichier PHP qui décrit la **création ou la modification d'une table**
- Elle est **versionnée avec Git** : toute l'équipe a la même structure de base
- Plus besoin d'échanger des exports SQL ou de cliquer dans phpMyAdmin
- Chaque migration a une méthode `up()` (appliquer) et `down()` (annuler)

> **Analogie** — Les migrations sont l'historique Git de votre base de données : on rejoue les étapes dans l'ordre pour obtenir la même structure partout.

### Créer la table posts

- `id()` : la clé primaire auto-incrémentée
- Types : `string`, `text`, `integer`, `boolean`, `date`, `decimal`…
- Options : `nullable()`, `default()`, `unique()`
- `foreignId('user_id')->constrained()` : clé étrangère vers `users.id`

```php
// php artisan make:migration create_posts_table
Schema::create('posts', function (Blueprint $t) {
    $t->id();                                // clé primaire
    $t->string('title');                     // VARCHAR(255)
    $t->text('content')->nullable();         // peut être vide
    $t->boolean('active')->default(true);
    $t->foreignId('user_id')->constrained(); // clé étrangère
    $t->timestamps();                        // created_at, updated_at
});
```

### Types de colonnes et options courants

| Méthode | Résultat |
|---|---|
| `$t->string('nom', 100)` | Texte court (VARCHAR) |
| `$t->text('contenu')` | Texte long |
| `$t->integer('ordre')` / `unsignedInteger` | Nombre entier |
| `$t->boolean('actif')` | Vrai / faux |
| `$t->enum('role', ['admin', 'apprenant'])` | Liste de valeurs autorisées |
| `$t->timestamp('termine_le')->nullable()` | Date et heure, peut être vide |
| `->constrained()->cascadeOnDelete()` | Supprime les lignes liées avec le parent |

---

## Cours 3 — Exécuter, annuler et remplir la base

| Champ | Valeur |
|---|---|
| Titre | Exécuter, annuler et remplir la base |
| Description | Faire évoluer la base sans rien casser. |
| Durée estimée (minutes) | 30 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_05_Migrations_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Les commandes de migration

- `migrate` : applique ce qui manque
- `rollback` : revient en arrière (appelle `down()`)
- Pour changer une table déjà migrée : une **nouvelle migration**
- `fresh --seed` : repart de zéro (en **développement** seulement !)

```bash
# Appliquer les migrations pas encore passées
php artisan migrate

# Annuler le dernier lot
php artisan migrate:rollback

# Modifier une table existante : NOUVELLE migration
php artisan make:migration add_slug_to_posts_table

# Tout supprimer, tout recréer, puis remplir
php artisan migrate:fresh --seed
```

> **Ne jamais modifier une migration déjà partagée** — Vos collègues ne la rejoueront pas : leur base serait différente de la vôtre. On ajoute une nouvelle migration.

### Seeders et Factories : des données de test

- **Factory** : le modèle de fausses données
- **Seeder** : remplir la base
- `fake()` génère des valeurs réalistes
- 10 articles créés en une ligne

```php
// database/factories/PostFactory.php
public function definition(): array
{
    return [
        'title'   => fake()->sentence(),
        'content' => fake()->paragraph(),
        'user_id' => User::factory(),
    ];
}

// database/seeders/DatabaseSeeder.php
public function run(): void
{
    Post::factory()->count(10)->create();
}

// php artisan db:seed
// ou php artisan migrate:fresh --seed
```

### Application PassQuiz — les tables des quiz

Section 9 du cahier des charges, traduite en migrations.

- `module_id` nullable : un quiz sans module = évaluation finale
- `est_correcte` : jamais envoyée au client (section 11)
- `unique(['user_id', 'cours_id'])` : un cours terminé une seule fois
- `numero` unique : PQ-LAR-2026-00001 (règle 6.4)

```php
Schema::create('quiz', function (Blueprint $t) {
    $t->id();
    $t->foreignId('formation_id')->constrained()->cascadeOnDelete();
    $t->foreignId('module_id')->nullable()->constrained();
    $t->string('titre');
    $t->unsignedTinyInteger('score_min')->default(60);
    $t->unsignedSmallInteger('duree_min')->default(20);
    $t->unsignedTinyInteger('max_tentatives')->default(3);
    $t->unsignedSmallInteger('delai_heures')->default(24);
    $t->timestamps();
});

Schema::create('reponses', function (Blueprint $t) {
    $t->id();
    $t->foreignId('question_id')->constrained()->cascadeOnDelete();
    $t->string('texte');
    $t->boolean('est_correcte')->default(false);
});

Schema::create('progression_cours', function (Blueprint $t) {
    $t->id();
    $t->foreignId('user_id')->constrained();
    $t->foreignId('cours_id')->constrained('cours');
    $t->timestamp('termine_le');
    $t->unique(['user_id', 'cours_id']);
});
```

### À retenir

- `.env` : paramètres de connexion
- Migration = structure de table versionnée (`up` / `down`)
- `id()`, types de colonnes, `nullable()`, `foreignId()->constrained()`
- `migrate`, `rollback`, nouvelle migration pour modifier
- Factories + seeders = données de test

### Pièges à éviter

- Lancer `migrate` avant d'avoir créé la base
- Modifier une ancienne migration déjà partagée
- `migrate:fresh` sur une base de production
- Clé étrangère vers une table pas encore créée (ordre des fichiers)
- Oublier `nullable()` sur une colonne facultative

*Module suivant → Models et Eloquent ORM*

---
