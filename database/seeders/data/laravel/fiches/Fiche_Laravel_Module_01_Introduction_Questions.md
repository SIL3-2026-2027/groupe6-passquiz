# Fiche de saisie — Questions du module 1 : Introduction à Laravel
> À copier dans l'administration PassQuiz (quiz du module). PDF correspondant : **Laravel_Module_01_Introduction_Questions.pdf**.

## Quiz — Module 1 : Introduction à Laravel

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Qu'est-ce que Laravel ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Un langage de programmation
- ⬜ Un système de gestion de base de données
- ⬜ Une bibliothèque JavaScript
- ✅ Un framework PHP open source

**Explication :** Laravel est écrit en PHP. Il fournit les outils d'une application web : routes, base de données, sécurité…



### Question 2 — Choix unique · 1 point

**Énoncé :** Dans l'architecture MVC, quel est le rôle du Controller ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Afficher la page HTML
- ✅ Recevoir la demande, appeler le Model et choisir la vue
- ⬜ Définir les URL
- ⬜ Stocker les données en base

**Explication :** Le Model gère les données, la Vue les affiche. Le Controller fait le lien entre les deux.



### Question 3 — Choix multiple · 1 point

**Énoncé :** Quels outils sont des prérequis pour un projet Laravel ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ MySQL (ou une autre base de données)
- ⬜ Python
- ✅ PHP 8.2 ou plus
- ✅ Composer

**Explication :** Python n'est pas nécessaire. Node.js est utile pour compiler les assets avec Vite.



### Question 4 — Choix unique · 1 point

**Énoncé :** Quelle commande crée un nouveau projet Laravel ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `php artisan new mon-projet`
- ⬜ `npm create laravel mon-projet`
- ⬜ `composer install laravel`
- ✅ `composer create-project laravel/laravel mon-projet`

**Explication :** Composer télécharge le squelette Laravel et ses dépendances dans le dossier `mon-projet`.



### Question 5 — Choix unique · 1 point

**Énoncé :** Quel est le seul dossier accessible directement depuis le web ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `public/`
- ⬜ `app/`
- ⬜ `storage/`
- ⬜ `resources/`

**Explication :** Le serveur pointe sur `public/` (qui contient `index.php`). Le reste du code n'est pas exposé : c'est une protection.



### Question 6 — Vrai / Faux · 1 point

**Énoncé :** Le fichier `.env` doit être envoyé sur GitHub pour que l'équipe ait les mêmes réglages.

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Vrai
- ✅ Faux

**Explication :** Faux. `.env` contient des secrets (mots de passe, clés) et des réglages propres à chaque machine. On partage `.env.example`.



### Question 7 — Choix unique · 1 point

**Énoncé :** Où se trouvent les vues Blade ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `routes/views`
- ⬜ `app/Views`
- ✅ `resources/views`
- ⬜ `public/views`

**Explication :** Les vues sont dans `resources/views`, avec l'extension `.blade.php`.



### Question 8 — Choix unique · 1 point

**Énoncé :** Que fait `php artisan make:model Post -m` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Crée le model Post et sa migration
- ⬜ Crée seulement le model Post
- ⬜ Exécute les migrations
- ⬜ Crée un controller Post

**Explication :** L'option `-m` génère aussi le fichier de migration qui créera la table `posts`.



### Question 9 — Choix multiple · 1 point

**Énoncé :** Quelles commandes Artisan sont correctement associées à leur rôle ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `serve` : déploie l'application en production
- ✅ `route:list` : liste les routes
- ✅ `tinker` : console pour tester du code
- ✅ `migrate` : met à jour les tables de la base

**Explication :** `serve` lance un serveur de **développement** local, pas un déploiement en production.



### Question 10 — Vrai / Faux · 1 point

**Énoncé :** Depuis Laravel 11, il faut lancer `php artisan install:api` pour obtenir `routes/api.php` et Sanctum.

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai. Le fichier n'est plus créé par défaut. C'est indispensable pour l'API de PassQuiz.

