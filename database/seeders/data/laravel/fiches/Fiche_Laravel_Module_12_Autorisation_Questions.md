# Fiche de saisie — Questions du module 12 : L'autorisation : Gates et Policies
> Questions rédigées par l'équipe à partir du cours du module 12.

## Quiz — Module 12 : L'autorisation : Gates et Policies

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Quelle question l'autorisation pose-t-elle ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Qui es-tu ?
- ✅ As-tu le droit de faire cette action ?
- ⬜ Ton mot de passe est-il assez fort ?
- ⬜ Ton jeton est-il encore valide ?

**Explication :** « Qui es-tu ? » relève de l'authentification (module 10). L'autorisation décide si l'utilisateur identifié a le droit d'agir.



### Question 2 — Choix unique · 1 point

**Énoncé :** Où définit-on une Gate avec `Gate::define(...)` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Dans `routes/web.php`
- ⬜ Dans le model `User`
- ✅ Dans la méthode `boot()` de `AppServiceProvider`
- ⬜ Dans le fichier `.env`

**Explication :** La Gate est enregistrée au démarrage de l'application, puis utilisable partout.



### Question 3 — Choix unique · 1 point

**Énoncé :** Que fait `Gate::authorize('update', $post)` si l'utilisateur n'a pas le droit ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Il déclenche une erreur 403
- ⬜ Il renvoie `false`
- ⬜ Il redirige vers `/login`
- ⬜ Il supprime l'article

**Explication :** `Gate::allows` et `Gate::denies` renvoient un booléen ; `Gate::authorize` arrête directement la requête avec une erreur 403.



### Question 4 — Choix unique · 1 point

**Énoncé :** Quelle commande crée une Policy pour le model `Post` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `php artisan make:gate PostPolicy`
- ⬜ `php artisan make:middleware PostPolicy`
- ⬜ `php artisan policy:create Post`
- ✅ `php artisan make:policy PostPolicy --model=Post`

**Explication :** `--model=Post` génère les méthodes `view`, `update`, `delete`… typées avec `Post $post`.



### Question 5 — Choix multiple · 1 point

**Énoncé :** Quelles affirmations sur les Policies sont vraies ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Une Policy regroupe les règles d'un model, avec une méthode par action
- ✅ Laravel associe automatiquement `PostPolicy` au model `Post`
- ⬜ Une Policy remplace la validation des formulaires
- ✅ Le premier paramètre de chaque méthode est l'utilisateur connecté

**Explication :** La validation vérifie les données envoyées (module 8) ; la Policy vérifie le droit d'agir sur la ressource.



### Question 6 — Choix unique · 1 point

**Énoncé :** Dans une vue Blade, comment afficher le bouton « Modifier » seulement si l'utilisateur a le droit ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `@auth('update', $post)` … `@endauth`
- ✅ `@can('update', $post)` … `@endcan`
- ⬜ `@if(Gate::define('update'))` … `@endif`
- ⬜ `@policy('update')` … `@endpolicy`

**Explication :** `@can` interroge la même Gate ou Policy que le controller.



### Question 7 — Vrai / Faux · 1 point

**Énoncé :** Cacher le bouton « Supprimer » avec `@can` suffit à protéger la suppression.

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Vrai
- ✅ Faux

**Explication :** Faux. N'importe qui peut envoyer la requête DELETE lui-même : il faut aussi appeler `Gate::authorize` dans le controller.



### Question 8 — Choix unique · 1 point

**Énoncé :** Que doit renvoyer `before()` pour laisser les autres méthodes de la Policy décider ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `false`
- ⬜ `true`
- ✅ `null`
- ⬜ Une erreur 403

**Explication :** `true` autorise tout, `false` refuse tout ; `null` signifie « je ne décide pas, continuez ».



### Question 9 — Choix unique · 1 point

**Énoncé :** Le middleware `role:admin,formateur` protège déjà les routes admin. Pourquoi ajouter une Policy sur `Formation` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Pour accélérer les requêtes
- ⬜ Pour remplacer Sanctum
- ⬜ Parce que le middleware ne fonctionne pas avec une API
- ✅ Pour qu'un formateur ne puisse modifier que **ses** formations, pas celles des autres

**Explication :** Le middleware filtre par rôle ; la Policy vérifie le droit sur une formation précise (`formateur_id`).



### Question 10 — Choix unique · 1 point

**Énoncé :** Dans PassQuiz, qui peut publier une formation (section 4.1) ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Le formateur qui l'a créée
- ⬜ Tout utilisateur connecté
- ✅ Seulement l'administrateur
- ⬜ L'apprenant inscrit

**Explication :** Le formateur crée sa formation en brouillon ; l'administrateur la valide et la publie (EF-05).
