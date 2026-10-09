# PassQuiz — Groupe 6

Plateforme d'e-learning réalisée par le **groupe 6 (SIL3)** : les apprenants suivent des formations organisées en modules et en cours, passent des quiz chronométrés et obtiennent un certificat vérifiable en ligne.

## Fonctionnalités

**Apprenant**
- Inscription, connexion, mot de passe oublié
- Catalogue des formations : Formation ➔ Modules ➔ Cours
- Lecture des cours (texte, vidéo, PDF) et « Marquer comme terminé »
- Suivi de la progression sur le tableau de bord
- Quiz : questions et réponses mélangées, choix unique, multiple ou vrai/faux, limite de temps, nombre de tentatives
- Score, historique des tentatives et certificat PDF

**Administrateur et formateur**
- Gestion des formations, modules, cours, quiz, questions et réponses
- Publication des formations
- Gestion des utilisateurs et suivi de leur progression
- Statistiques, tentatives et certificats délivrés

**Général**
- Page publique de vérification d'un certificat
- Notifications
- Thème clair / sombre

## Technologies

| Partie | Outils |
|---|---|
| Backend | PHP 8.3, Laravel 13, Laravel Sanctum, DomPDF |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Base de données | SQLite (par défaut) ou MySQL |
| Tests | PHPUnit |

## Installation

Prérequis : PHP 8.3+, Composer, Node.js 20+.

```bash
git clone https://github.com/SIL3-2026-2027/groupe6-passquiz.git
cd groupe6-passquiz

composer install
npm install

cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
```

Lancer l'application (deux terminaux) :

```bash
php artisan serve
npm run dev
```

Puis ouvrir http://localhost:8000

## Comptes de test

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | admin@passquiz.com | password |
| Formateur | formateur@passquiz.com | password |
| Apprenant | apprenant@passquiz.com | password |

## Tests

```bash
php artisan test
```

## Structure du projet

```
app/Http/Controllers   Contrôleurs de l'API (apprenant et Admin/)
app/Models             Modèles Eloquent
database/migrations    Schéma de la base de données
database/seeders       Données de démonstration (formations Laravel et React)
resources/js           Application React (pages, composants, contextes)
routes/api.php         Routes de l'API
tests/Feature          Tests
```

## Membres du groupe 6

| Membre | Partie |
|---|---|
| [@adjakotan](https://github.com/adjakotan) | API Laravel et mise en place du dépôt |
| [@Ulrich134](https://github.com/Ulrich134) | Initialisation React et authentification |
| [@Mouni2004-max](https://github.com/Mouni2004-max) | Affichage des cours et suivi de progression |
| [@Mazinou-boop](https://github.com/Mazinou-boop) | Interface du quiz |
| [@Antoinette12334](https://github.com/Antoinette12334) | Certificats et espace administrateur |
