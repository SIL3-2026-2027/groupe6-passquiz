# Fiche de saisie — Les middleware
> Formation **Laravel**. Module rédigé par l'équipe (aucune fiche ni PDF fourni), dans la suite du module 10 (« Module suivant → les middleware »).

## Module

| Champ | Valeur |
|---|---|
| Ordre | 11 |
| Titre | Les middleware |
| Description | Filtrer les requêtes avant qu'elles n'atteignent le controller : connexion, rôles, limitation de débit. |

## Cours 1 — Le rôle d'un middleware

| Champ | Valeur |
|---|---|
| Titre | Le rôle d'un middleware |
| Description | Un filtre placé entre la requête et le controller. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | (aucun) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Un filtre entre la requête et le controller

- Un **middleware** s'exécute **avant** (ou après) l'action du controller
- Il peut **laisser passer** la requête, ou la **refuser** (redirection, erreur 401, 403, 429…)
- Plusieurs middleware s'enchaînent : chacun passe la main au suivant

```text
Navigateur
   │  GET /dashboard
   ▼
Middleware auth      ← connecté ?      non → /login
   │
   ▼
Middleware role      ← bon rôle ?      non → 403
   │
   ▼
Controller           ← l'action s'exécute
```

> **Analogie** — Le middleware est le contrôleur à l'entrée d'une salle : il vérifie le billet avant de laisser entrer. Le controller, lui, s'occupe du spectacle.

### Les middleware fournis par Laravel

| Middleware | Rôle |
|---|---|
| `auth` | Connecté obligatoire (sinon redirection vers `/login`, ou erreur 401 pour une API) |
| `auth:sanctum` | Jeton Sanctum valide obligatoire (API, module 10) |
| `guest` | Réservé aux visiteurs **non** connectés (pages de connexion, d'inscription) |
| `verified` | Adresse e-mail vérifiée obligatoire |
| `throttle:10,1` | Au plus 10 requêtes par minute, sinon erreur **429** |

### Appliquer un middleware

```php
// Sur une route
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('auth');

// Sur un groupe (module 2)
Route::middleware('auth')->group(function () {
    Route::get('/profil', [ProfilController::class, 'edit']);
    Route::put('/profil', [ProfilController::class, 'update']);
});

// Plusieurs middleware à la suite
Route::middleware(['auth', 'verified'])->group(function () {
    // ...
});
```

---

## Cours 2 — Créer son propre middleware

| Champ | Valeur |
|---|---|
| Titre | Créer son propre middleware |
| Description | Écrire une règle une fois, l'appliquer partout. |
| Durée estimée (minutes) | 25 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | (aucun) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Générer et écrire la méthode handle()

- `php artisan make:middleware EnsureUserIsActive`
- Fichier généré dans `app/Http/Middleware/`
- `handle()` reçoit la requête et `$next`
- `return $next($request);` : **laisse passer** vers la suite (middleware suivant, puis controller)
- `abort(403)` ou `redirect()` : **arrête** la requête

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->actif) {
            abort(403, 'Compte désactivé.');
        }

        return $next($request); // on laisse passer
    }
}
```

### Déclarer un alias (Laravel 11 et 12)

- Les middleware se déclarent dans `bootstrap/app.php`
- Un **alias** donne un nom court, utilisable dans les routes
- L'ancien fichier `app/Http/Kernel.php` n'existe plus depuis Laravel 11

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'actif' => \App\Http\Middleware\EnsureUserIsActive::class,
    ]);
})

// routes/web.php
Route::middleware(['auth', 'actif'])->group(function () {
    // ...
});
```

### Avant ou après le controller

```php
public function handle(Request $request, Closure $next): Response
{
    // AVANT : on peut refuser la requête ici

    $response = $next($request); // le controller s'exécute

    // APRÈS : on peut modifier la réponse ici
    $response->headers->set('X-App', 'PassQuiz');

    return $response;
}
```

---

## Cours 3 — Paramètres, rôles et limitation de débit

| Champ | Valeur |
|---|---|
| Titre | Paramètres, rôles et limitation de débit |
| Description | Un middleware réutilisable pour chaque rôle, et des routes protégées des abus. |
| Durée estimée (minutes) | 25 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | (aucun) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Un middleware avec des paramètres

- Les paramètres s'écrivent après `:`, séparés par des virgules : `role:admin,formateur`
- Ils arrivent dans `handle()` après `$next`
- `string ...$roles` les récupère sous forme de tableau : `['admin', 'formateur']`

```php
// app/Http/Middleware/EnsureUserHasRole.php
public function handle(Request $request, Closure $next, string ...$roles): Response
{
    if (! in_array($request->user()?->role, $roles, true)) {
        abort(403, 'Accès refusé.');
    }

    return $next($request);
}

// bootstrap/app.php
$middleware->alias([
    'role' => \App\Http\Middleware\EnsureUserHasRole::class,
]);
```

> **401 ou 403 ?** — 401 : on ne sait pas qui vous êtes (pas connecté). 403 : on sait qui vous êtes, mais vous n'avez pas le droit.

### Limiter le débit : throttle

- `throttle:10,1` : **10** requêtes par **1** minute et par utilisateur
- Au-delà : erreur **429 Too Many Requests**
- Protège contre les scripts qui envoient des centaines de requêtes

```php
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // 5 essais par minute
```

### Application PassQuiz — rôles et routes de quiz (ENF-02, section 11)

Le middleware `role` annoncé au module 2, et la limitation de débit des quiz.

- Groupe admin : `auth:sanctum` puis `role:admin,formateur`
- Un apprenant qui appelle `/api/admin/...` reçoit une erreur **403**
- Routes de quiz limitées (section 11 : « limitation de débit sur les routes de quiz »)

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {

    Route::middleware('throttle:30,1')->group(function () {
        Route::post('/quiz/{quiz}/demarrer', [TentativeController::class, 'demarrer']);
        Route::post('/tentatives/{tentative}/soumettre', [TentativeController::class, 'soumettre']);
    });

    Route::prefix('admin')->name('admin.')
        ->middleware('role:admin,formateur')
        ->group(function () {
            Route::apiResource('formations', Admin\FormationController::class);
        });
});
```

### À retenir

- Middleware = filtre **avant** (ou après) le controller
- `return $next($request)` laisse passer ; `abort()` arrête
- `make:middleware`, alias dans `bootstrap/app.php`
- Paramètres : `role:admin,formateur` → `string ...$roles`
- `auth`, `auth:sanctum`, `guest`, `throttle`

### Pièges à éviter

- Oublier `return $next($request);` : la page ne s'affiche jamais
- Chercher `app/Http/Kernel.php` dans un projet Laravel 11 ou 12
- Mettre `role` avant `auth` : `$request->user()` est encore `null`
- Renvoyer 401 à un utilisateur connecté qui n'a pas le droit (c'est 403)
- Laisser les routes de connexion et de quiz sans `throttle`

*Module suivant → l'autorisation : Gates et Policies*

---
