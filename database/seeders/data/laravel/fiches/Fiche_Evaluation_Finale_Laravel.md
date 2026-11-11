# Fiche de saisie — Évaluation finale Laravel
> Formation **Laravel**. Questions inédites rédigées par l'équipe à partir des cours des modules 1 à 12. Aucune ne reprend une question des quiz de modules.

Évaluation finale de la formation (quiz **sans module**, `module_id` nul). Accessible quand tous les modules sont validés (EF-11).

## Quiz — Évaluation finale Laravel

| Paramètre | Valeur |
|---|---|
| Score minimum | 70 % |
| Durée | 30 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Dans le trajet MVC vu en cours, qui décide quel controller répond à une URL ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Le Model
- ✅ La route
- ⬜ La vue Blade
- ⬜ Le fichier `.env`

**Explication :** La route (`routes/web.php` ou `routes/api.php`) associe l'adresse demandée à la méthode du controller qui répond (module 1).



### Question 2 — Choix multiple · 1 point

**Énoncé :** Quels réglages trouve-t-on dans le fichier `.env` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Les accès à la base de données (`DB_DATABASE`, `DB_USERNAME`…)
- ✅ Le mode debug (`APP_DEBUG`)
- ⬜ La liste des routes de l'application
- ✅ L'adresse de l'application (`APP_URL`)

**Explication :** `.env` contient les réglages propres à chaque machine. Les routes sont déclarées dans le dossier `routes/` (modules 1 et 5).



### Question 3 — Choix unique · 1 point

**Énoncé :** Quelle est l'adresse et le nom de cette route ?

```php
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', ...)->name('users');
});
```

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `/users` et `users`
- ⬜ `/admin/users` et `users`
- ✅ `/admin/users` et `admin.users`
- ⬜ `/users` et `admin.users`

**Explication :** Le groupe ajoute son préfixe au début de l'URL et son nom au début du nom de chaque route (module 2).



### Question 4 — Choix multiple · 1 point

**Énoncé :** Quelles routes sont créées par `Route::apiResource('posts', PostController::class)` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `GET /posts` (index)
- ⬜ `GET /posts/create` (create)
- ✅ `POST /posts` (store)
- ✅ `DELETE /posts/{id}` (destroy)

**Explication :** `apiResource` crée 5 routes : il retire `create` et `edit`, qui affichent des formulaires HTML (module 2).



### Question 5 — Choix unique · 1 point

**Énoncé :** Pourquoi le Route Model Binding ne fonctionne-t-il pas ici ?

```php
// Route::get('/posts/{id}', [PostController::class, 'show']);
public function show(Post $post)
{
    return view('posts.show', compact('post'));
}
```

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Il manque un appel à `findOrFail`
- ⬜ La méthode doit s'appeler `index`
- ⬜ Il faut écrire `show(int $post)`
- ✅ Le paramètre de route `{id}` ne porte pas le même nom que `$post`

**Explication :** Laravel relie `{post}` à `$post`. Avec `{id}`, il ne sait pas quel modèle charger : il faut renommer le paramètre en `{post}` (module 3).



### Question 6 — Choix unique · 1 point

**Énoncé :** Quelle commande génère un controller d'API dont les méthodes reçoivent `Formation $formation` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `php artisan make:controller FormationController -r`
- ⬜ `php artisan make:model Formation --api`
- ✅ `php artisan make:controller FormationController --api --model=Formation`
- ⬜ `php artisan make:controller FormationController --view`

**Explication :** `--api` donne les 5 méthodes sans `create` ni `edit`, et `--model=Formation` les type pour le Route Model Binding (module 3).



### Question 7 — Choix unique · 1 point

**Énoncé :** Un utilisateur a écrit `<script>alert('x')</script>` dans `$commentaire`. Que se passe-t-il avec cette vue ?

```blade
<p>{{ $commentaire }}</p>
```

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Le texte s'affiche tel quel : le script n'est pas exécuté
- ⬜ Le script s'exécute chez tous les visiteurs
- ⬜ Laravel supprime le commentaire
- ⬜ Laravel renvoie une erreur 419

**Explication :** `{{ }}` neutralise le HTML et protège contre les failles XSS. Avec `{!! !!}`, le script serait exécuté (module 4).



### Question 8 — Vrai / Faux · 1 point

**Énoncé :** `@extends` doit être la première ligne de la vue qui hérite d'un layout.

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai. C'est l'un des pièges du module 4 : la vue déclare d'abord son layout, puis remplit ses `@section`.



### Question 9 — Choix unique · 1 point

**Énoncé :** Dans la table `quiz`, la colonne `formation_id` est créée avec `->constrained()->cascadeOnDelete()`. Que se passe-t-il quand on supprime une formation ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ La suppression est refusée tant qu'il reste des quiz
- ✅ Ses quiz sont supprimés automatiquement avec elle
- ⬜ Ses quiz restent, avec `formation_id` à `null`
- ⬜ Toute la table `quiz` est vidée

**Explication :** `cascadeOnDelete()` supprime les lignes liées en même temps que le parent (module 5).



### Question 10 — Vrai / Faux · 1 point

**Énoncé :** Si `php artisan migrate` affiche « Unknown database », c'est que la base indiquée dans `.env` n'existe pas encore.

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai. Les migrations créent les tables, pas la base : il faut d'abord la créer (par exemple dans phpMyAdmin), module 5.



### Question 11 — Choix unique · 1 point

**Énoncé :** Que renvoie `Post::where('active', 1)->count()` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Une collection de Posts
- ⬜ Le premier Post actif
- ✅ Le nombre d'articles actifs
- ⬜ `true` s'il existe au moins un article actif

**Explication :** `count()` exécute la requête et renvoie un entier ; `get()` renverrait la collection (module 6).



### Question 12 — Choix unique · 1 point

**Énoncé :** Combien de requêtes ce code exécute-t-il pour 10 formations ?

```php
$formations = Formation::all();
foreach ($formations as $formation) {
    echo $formation->modules->count();
}
```

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ 1
- ⬜ 2
- ⬜ 10
- ✅ 11

**Explication :** 1 requête pour la liste, puis 1 par formation : c'est le problème N+1. Avec `Formation::with('modules')->get()`, il n'y en a plus que 2 (module 7).



### Question 13 — Choix unique · 1 point

**Énoncé :** Quelle instruction ajoute les tags 1 et 3 à un article, sans retirer ceux qu'il a déjà ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `$post->tags()->attach([1, 3])`
- ⬜ `$post->tags()->sync([1, 3])`
- ⬜ `$post->tags()->detach([1, 3])`
- ⬜ `$post->tags = [1, 3]`

**Explication :** `attach` ajoute des lignes dans la table pivot ; `sync` remplacerait la liste entière (module 7).



### Question 14 — Choix multiple · 1 point

**Énoncé :** Quelles règles de validation correspondent à « mot de passe obligatoire, d'au moins 8 caractères, identique à sa confirmation » (EF-01) ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `required`
- ⬜ `unique:users`
- ✅ `min:8`
- ✅ `confirmed`

**Explication :** `unique` sert à l'e-mail, pas au mot de passe. `confirmed` exige un champ `password_confirmation` identique (module 8).



### Question 15 — Choix unique · 1 point

**Énoncé :** Dans la vue d'une liste paginée avec `Post::latest()->paginate(10)`, quelle instruction affiche les liens de pagination ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `@paginate($posts)`
- ✅ `{{ $posts->links() }}`
- ⬜ `{{ $posts->pages() }}`
- ⬜ `@foreach ($posts->pages as $page)`

**Explication :** `links()` affiche la navigation ; le numéro de page est lu dans `?page=` (module 9).



### Question 16 — Choix unique · 1 point

**Énoncé :** Quel trait le model `User` doit-il utiliser pour pouvoir appeler `$user->createToken('passquiz')` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `Notifiable`
- ⬜ `HasFactory`
- ✅ `HasApiTokens`
- ⬜ `Authorizable`

**Explication :** `HasApiTokens` vient de Laravel Sanctum. Sans lui, `createToken` provoque une erreur (module 10).



### Question 17 — Choix unique · 1 point

**Énoncé :** Dans la connexion de PassQuiz, que se passe-t-il si les identifiants sont bons mais que l'admin a désactivé le compte (`actif` à faux) ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ La connexion réussit normalement
- ⬜ Une erreur 401 « Identifiants invalides »
- ✅ Une erreur 403 « Compte désactivé. »
- ⬜ Le compte est supprimé

**Explication :** `abort_unless($user->actif, 403, 'Compte désactivé.')` : l'utilisateur est bien identifié, mais n'a plus le droit d'entrer (module 10).



### Question 18 — Choix unique · 1 point

**Énoncé :** Pour la zone admin de l'API PassQuiz, quelle liste de middleware est dans le bon ordre ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `['role:admin,formateur', 'auth:sanctum']`
- ✅ `['auth:sanctum', 'role:admin,formateur']`
- ⬜ `['guest', 'role:admin,formateur']`
- ⬜ `['role:admin,formateur']` seul suffit

**Explication :** Il faut d'abord identifier l'utilisateur (jeton), puis vérifier son rôle : sinon `$request->user()` est encore `null` (module 11).



### Question 19 — Choix unique · 1 point

**Énoncé :** Avec cette Policy, que se passe-t-il quand le formateur n° 7 modifie la formation dont `formateur_id` vaut 4 ?

```php
public function update(User $user, Formation $formation): bool
{
    return $formation->formateur_id === $user->id;
}

// Admin\FormationController@update
Gate::authorize('update', $formation);
```

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ La modification est enregistrée
- ⬜ Une erreur 401
- ⬜ Une erreur 404
- ✅ Une erreur 403

**Explication :** La Policy renvoie `false` et `Gate::authorize` arrête la requête : un formateur ne gère que ses formations (module 12, section 4.2).



### Question 20 — Choix multiple · 1 point

**Énoncé :** Pour qu'un apprenant ne puisse télécharger que ses propres certificats (EF-19), que faut-il mettre en place ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Une Policy (ou une Gate) qui compare le `user_id` du certificat à l'utilisateur connecté
- ✅ Un appel à `Gate::authorize` dans le controller de téléchargement
- ⬜ Seulement cacher le lien dans l'interface React
- ✅ Le middleware `auth:sanctum` sur la route de téléchargement

**Explication :** Masquer le lien ne protège rien : la route doit exiger un jeton (module 11) et vérifier le droit côté serveur (module 12).
