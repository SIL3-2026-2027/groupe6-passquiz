# Fiche de saisie — Les routes
> À copier dans l'administration PassQuiz (formation **Laravel**). PDF du cours à joindre : **Laravel_Module_02_Routes_Cours.pdf** · Questions et corrigé : **Laravel_Module_02_Routes_Questions.pdf**.

## Module

| Champ | Valeur |
|---|---|
| Ordre | 2 |
| Titre | Les routes |
| Description | Associer chaque adresse de l'application à une action. |

## Cours 1 — Créer des routes

| Champ | Valeur |
|---|---|
| Titre | Créer des routes |
| Description | Une route = une adresse + une action. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_02_Routes_Cours.pdf (à joindre au cours 1 ; ou à chaque cours) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Présentation et création d'une route

- Une **route** associe une **URL** à une **action**
- On écrit : le type de requête, l'adresse, puis l'action
- L'action peut être une **fonction** (closure) ou une méthode de **controller**
- `routes/web.php` : pages du site · `routes/api.php` : API (JSON)

```php
// routes/web.php
Route::get('/bonjour', function () {
    return 'Bonjour Laravel';
});
```

> **Trajet** — Navigateur → `GET /bonjour` → Laravel cherche une route correspondante → exécute l'action → renvoie la réponse.

### Les types de requêtes HTTP

- **GET** lit · **POST** envoie · **PUT/PATCH** modifie · **DELETE** supprime
- Même URL + verbe différent = **route différente**
- `Route::view` : une page sans logique, sans controller

```php
Route::get('/posts', ...);       // lire
Route::post('/posts', ...);      // créer
Route::put('/posts/1', ...);     // modifier
Route::delete('/posts/1', ...);  // supprimer

// Afficher directement une vue
Route::view('/contact', 'contact');
```

> **Formulaires HTML** — Un `<form>` ne sait envoyer que GET et POST. Pour PUT ou DELETE, on ajoute `@method('PUT')` dans le formulaire (module 4).

---

## Cours 2 — Paramètres et routes nommées

| Champ | Valeur |
|---|---|
| Titre | Paramètres et routes nommées |
| Description | Des URL variables, et des liens qui ne cassent pas. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_02_Routes_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Paramètres, contraintes et paramètre optionnel

- `{id}` : la valeur de l'URL est **transmise** à l'action
- `{nom?}` : paramètre **facultatif** → valeur par défaut obligatoire
- `where('id', '[0-9]+')` : exige un **nombre** ; sinon erreur 404
- Raccourci : `->whereNumber('id')`

```php
// Paramètre obligatoire + contrainte + nom
Route::get('/posts/{id}', function ($id) {
    return "Article numéro $id";
})->where('id', '[0-9]+')
  ->name('posts.show');

// Paramètre optionnel : ? + valeur par défaut
Route::get('/salut/{nom?}', fn ($nom = 'invité') =>
    "Salut $nom");
```

### Les routes nommées

- `->name('posts.show')` donne un **nom** à la route
- `route('nom', paramètres)` **génère l'URL**
- Si l'adresse change dans `web.php`, tous les liens suivent automatiquement

```blade
{{-- Dans une vue Blade --}}
<a href="{{ route('posts.show', 5) }}">Voir</a>

{{-- Résultat : /posts/5 --}}

<?php
// Dans un controller : redirection
return redirect()->route('posts.show', $post);
```

> **Convention** — Nommer `ressource.action` : `posts.index`, `posts.show`, `posts.store`…

---

## Cours 3 — Controllers, groupes et resource

| Champ | Valeur |
|---|---|
| Titre | Controllers, groupes et resource |
| Description | Garder le fichier des routes court et lisible. |
| Durée estimée (minutes) | 30 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_02_Routes_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Une route vers un controller

- La route désigne une **méthode** d'un controller : `[Classe::class, 'méthode']`
- Ne pas oublier le `use` en haut du fichier
- La logique quitte `web.php` pour aller dans le controller (module 3)

```php
use App\Http\Controllers\PostController;

Route::get('/posts',
    [PostController::class, 'index']);

Route::get('/posts/{id}',
    [PostController::class, 'show']);
```

### Les groupes de routes

- **prefix** : début d'URL commun
- **name** : début de nom commun
- **middleware** : filtre appliqué à toutes les routes (ex. `auth` : connecté obligatoire)
- On évite de répéter la même chose sur chaque ligne

```php
Route::prefix('admin')
    ->name('admin.')
    ->middleware('auth')
    ->group(function () {
        Route::get('/tableau', ...)->name('tableau');
        Route::get('/users', ...)->name('users');
    });

// URL : /admin/tableau  · nom : admin.tableau
```

### Routes Resource : un CRUD en une ligne

**Une seule ligne**

```php
Route::resource('posts',
    PostController::class);

// Vérifier :
// php artisan route:list
```

- Crée les **7 routes** d'un CRUD
- Chaque route appelle une méthode du controller

**Les 7 routes créées**

```text
GET     /posts            index
GET     /posts/create     create
POST    /posts            store
GET     /posts/{id}       show
GET     /posts/{id}/edit  edit
PUT     /posts/{id}       update
DELETE  /posts/{id}       destroy
```

### resource ou apiResource ?

- `Route::resource` : **7 routes**, dont `create` et `edit` qui affichent des **formulaires HTML**
- `Route::apiResource` : **5 routes**, sans `create` ni `edit`
- Une API ne renvoie pas de formulaires : c'est le front (React) qui les affiche
- `->only([...])` ou `->except([...])` pour n'en garder qu'une partie

> **Pour PassQuiz** — Le backend est une API consommée par React : on utilise `apiResource` dans `routes/api.php`.

### Application PassQuiz — les routes de l'API

Section 12 du cahier des charges, traduite en routes Laravel.

- Préfixe `/api` ajouté automatiquement par `api.php`
- Routes publiques : inscription, connexion, catalogue, vérification (EF-20)
- Groupe `auth:sanctum` : il faut un jeton valide
- Groupe admin : préfixe + nom + middleware `role` (à créer, ENF-02)

```php
// routes/api.php
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/formations', [FormationController::class, 'index']);
Route::get('/formations/{formation}', [FormationController::class, 'show']);
Route::get('/verification/{numero}', [CertificatController::class, 'verifier'])
    ->name('verification');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/formations/{formation}/inscription',
        [InscriptionController::class, 'store']);
    Route::post('/cours/{cours}/terminer',
        [ProgressionController::class, 'terminer']);
    Route::post('/quiz/{quiz}/demarrer',
        [TentativeController::class, 'demarrer']);
    Route::post('/tentatives/{tentative}/soumettre',
        [TentativeController::class, 'soumettre']);

    Route::prefix('admin')->name('admin.')
        ->middleware('role:admin,formateur')->group(function () {
            Route::apiResource('formations', Admin\FormationController::class);
        });
});
```

### À retenir

- Une route = **verbe HTTP + adresse + action**
- `{id}` paramètre, `{id?}` optionnel, `where` contrainte
- `->name()` + `route()` : des liens qui ne cassent pas
- Groupes : `prefix`, `name`, `middleware`
- `Route::resource` = 7 routes ; `apiResource` = 5

### Pièges à éviter

- Oublier le `use` du controller dans le fichier de routes
- Paramètre optionnel `{nom?}` sans valeur par défaut
- Écrire les URL en dur au lieu d'utiliser `route()`
- Un formulaire en `method="PUT"` (impossible en HTML)
- `Route::resource` pour une API : routes `create` / `edit` inutiles

*Module suivant → les controllers*

---
