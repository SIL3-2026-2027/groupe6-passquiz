# Fiche de saisie — Introduction à Laravel
> À copier dans l'administration PassQuiz (formation **Laravel**). PDF du cours à joindre : **Laravel_Module_01_Introduction_Cours.pdf** · Questions et corrigé : **Laravel_Module_01_Introduction_Questions.pdf**.

## Module

| Champ | Valeur |
|---|---|
| Ordre | 1 |
| Titre | Introduction à Laravel |
| Description | Découvrir le framework, comprendre MVC, installer et créer son premier projet. |

## Cours 1 — Découvrir Laravel

| Champ | Valeur |
|---|---|
| Titre | Découvrir Laravel |
| Description | Un framework PHP qui fournit les briques d'une application web prêtes à l'emploi. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_01_Introduction_Cours.pdf (à joindre au cours 1 ; ou à chaque cours) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Présentation et avantages

**Laravel** est un framework PHP **open source**, créé par **Taylor Otwell en 2011**.

- **Avantages** : syntaxe claire, sécurité intégrée, communauté active, documentation de qualité
- **Outils inclus** : routes, base de données, authentification, validation, e-mails, tâches planifiées
- **Utilité** : sites web, applications métier, API pour mobile, boutiques en ligne

> **Pourquoi un framework ?** — Sans framework, on réécrit à chaque projet le routage, la connexion à la base, la sécurité des formulaires… Laravel fournit tout cela, testé et documenté, pour se concentrer sur le métier.

### L'architecture MVC

- **Model** : gère les données et les règles liées à la base
- **View** : affiche les informations sous forme de pages
- **Controller** : reçoit la demande, appelle le Model et choisit la vue
- La **route** décide quel controller répond à quelle URL

```text
Navigateur
   │  GET /posts
   ▼
Route        routes/web.php
   │
   ▼
Controller   ← reçoit la demande
   │      ↘
   │       Model   ← lit / écrit en base
   ▼
Vue (Blade)  ← page HTML renvoyée
```

> **Pourquoi séparer ?** — Chaque partie a un seul rôle : on peut changer l'affichage sans toucher aux données, et inversement.

---

## Cours 2 — Installer et créer un projet

| Champ | Valeur |
|---|---|
| Titre | Installer et créer un projet |
| Description | PHP, Composer, MySQL, Node.js… puis une seule commande. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_01_Introduction_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Les prérequis

Chaque outil doit répondre à sa commande de version.

1. **PHP 8.2 ou plus** : Sous Windows : fourni par XAMPP (ajouter `C:\xampp\php` au PATH)
2. **Composer** : Le gestionnaire de paquets PHP (installateur sur getcomposer.org)
3. **MySQL** : Fourni par XAMPP : démarrer MySQL dans le panneau de contrôle
4. **Node.js + éditeur** : Node pour compiler le CSS/JS (Vite), VS Code pour coder

```bash
php -v
composer -V
node -v
```

### Créer et lancer le projet

1. **Créer** : Composer télécharge Laravel dans un nouveau dossier
2. **Entrer** : dans le dossier du projet
3. **Lancer** : le serveur local de développement
4. **Ouvrir** : http://127.0.0.1:8000 dans le navigateur

```bash
composer create-project laravel/laravel mon-projet
cd mon-projet
php artisan serve
# Ouvrir http://127.0.0.1:8000
```

> **Pourquoi php artisan serve ?** — Il démarre un petit serveur web pointé sur le dossier `public/`. Pas besoin de placer le projet dans `htdocs`.

### Le fichier .env : la configuration locale

- Réglages **propres à chaque machine** : base de données, mode debug, clés
- XAMPP : utilisateur `root`, mot de passe vide par défaut
- Créer la base `passquiz` dans phpMyAdmin avant de migrer
- Lu dans le code avec `env()` / `config()`

```ini
APP_NAME=PassQuiz
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=passquiz
DB_USERNAME=root
DB_PASSWORD=
```

> **Jamais sur GitHub** — `.env` contient des secrets : il est dans `.gitignore`. On partage `.env.example` à la place.

---

## Cours 3 — Structure et commandes Artisan

| Champ | Valeur |
|---|---|
| Titre | Structure et commandes Artisan |
| Description | Savoir où se trouve chaque chose. |
| Durée estimée (minutes) | 20 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_01_Introduction_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Structure d'un projet Laravel

- `app` : Models, Controllers et logique
- `routes` : les adresses de l'application
- `resources` : les vues Blade
- `database` : migrations et seeders
- `public` : le **seul** dossier visible du web
- `storage` : logs, cache et fichiers envoyés
- `.env` : les réglages de la machine

```text
mon-projet/
├── app/
│   ├── Http/Controllers/
│   └── Models/
├── routes/web.php
├── resources/views/
├── database/migrations/
├── public/
├── storage/
└── .env
```

### Les commandes Artisan

- **Artisan** : l'outil en ligne de commande de Laravel
- **make:** génère des fichiers prêts à remplir
- **migrate** crée ou met à jour les tables
- **route:list** et **tinker** pour vérifier et tester

```bash
# Créer un model avec sa migration
php artisan make:model Post -m

# Créer un controller
php artisan make:controller PostController

# Exécuter les migrations
php artisan migrate

# Lister les routes
php artisan route:list

# Console pour tester du code
php artisan tinker
```

> **Astuce** — `php artisan list` affiche toutes les commandes ; `php artisan help make:model` détaille les options.

### Application PassQuiz — créer le projet API

Le backend de PassQuiz est une API Laravel consommée par React (section 12 du cahier).

- Projet `passquiz-api`, base MySQL `passquiz`
- **install:api** ajoute `routes/api.php` et **Sanctum** (authentification par jeton, ENF-01)
- Premiers models : Formation, Module, Cours (avec migrations)
- Vérifier avec `route:list`

```bash
composer create-project laravel/laravel passquiz-api
cd passquiz-api

# .env : DB_DATABASE=passquiz
php artisan install:api

php artisan make:model Formation -m
php artisan make:model Module -m
php artisan make:model Cours -m

php artisan migrate
php artisan route:list
php artisan serve
```

> **Pourquoi install:api ?** — Depuis Laravel 11, le fichier `routes/api.php` n'existe plus par défaut : cette commande le crée et installe Sanctum.

### À retenir

- Laravel : framework PHP open source (2011)
- **MVC** : Model = données, View = affichage, Controller = logique
- `composer create-project` puis `php artisan serve`
- `.env` = réglages locaux, jamais partagés
- **Artisan** génère et pilote le projet

### Pièges à éviter

- Oublier de créer la base avant `php artisan migrate`
- Versionner le fichier `.env`
- Placer des fichiers publics ailleurs que dans `public/`
- PHP de XAMPP trop ancien (< 8.2)
- Lancer `php artisan …` hors du dossier du projet

*Module suivant → les routes*

---
