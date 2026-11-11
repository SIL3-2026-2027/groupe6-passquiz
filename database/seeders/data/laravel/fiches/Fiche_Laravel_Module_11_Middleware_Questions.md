# Fiche de saisie — Questions du module 11 : Les middleware
> Questions rédigées par l'équipe à partir du cours du module 11.

## Quiz — Module 11 : Les middleware

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Qu'est-ce qu'un middleware ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Une table intermédiaire entre deux models
- ✅ Un filtre exécuté avant (ou après) l'action du controller, qui peut laisser passer ou refuser la requête
- ⬜ Une vue Blade partagée
- ⬜ Une commande Artisan

**Explication :** Le middleware se place entre la requête et le controller : `auth` vérifie la connexion, `role` le rôle, `throttle` le débit.



### Question 2 — Choix unique · 1 point

**Énoncé :** Sur un site Blade, que fait le middleware `auth` quand le visiteur n'est pas connecté ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Il affiche la page quand même
- ⬜ Il crée un compte automatiquement
- ✅ Il redirige vers la page de connexion
- ⬜ Il renvoie une erreur 500

**Explication :** Pour une API, il renvoie à la place une erreur 401 (non authentifié).



### Question 3 — Choix unique · 1 point

**Énoncé :** Quelle commande crée un middleware ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `php artisan middleware:create EnsureUserHasRole`
- ⬜ `composer make:middleware EnsureUserHasRole`
- ⬜ `php artisan make:filter EnsureUserHasRole`
- ✅ `php artisan make:middleware EnsureUserHasRole`

**Explication :** Le fichier est généré dans `app/Http/Middleware/`, avec une méthode `handle()` à compléter.



### Question 4 — Choix unique · 1 point

**Énoncé :** Dans la méthode `handle()`, que fait `return $next($request);` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Il laisse passer la requête vers la suite (middleware suivant, puis controller)
- ⬜ Il annule la requête
- ⬜ Il redirige vers la page suivante du site
- ⬜ Il recharge la page

**Explication :** Sans cette ligne, la requête n'atteint jamais le controller. Pour refuser, on utilise `abort(403)` ou une redirection.



### Question 5 — Choix unique · 1 point

**Énoncé :** Depuis Laravel 11, où déclare-t-on l'alias d'un middleware (par exemple `role`) ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Dans `app/Http/Kernel.php`
- ✅ Dans `bootstrap/app.php`, avec `$middleware->alias([...])`
- ⬜ Dans le fichier `.env`
- ⬜ Dans `config/database.php`

**Explication :** Le fichier `Kernel.php` a disparu avec Laravel 11 : la configuration des middleware se fait dans `bootstrap/app.php`.



### Question 6 — Choix multiple · 1 point

**Énoncé :** Quelles écritures appliquent bien un middleware ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `Route::get('/dashboard', ...)->middleware('auth')`
- ✅ `Route::middleware('auth')->group(function () { ... })`
- ⬜ `Route::get('/dashboard', ...)->auth()`
- ✅ `Route::middleware(['auth', 'role:admin'])->group(function () { ... })`

**Explication :** On applique un middleware avec `middleware()`, sur une route ou sur un groupe, éventuellement avec un tableau de plusieurs middleware.



### Question 7 — Choix unique · 1 point

**Énoncé :** Avec `->middleware('role:admin,formateur')`, que reçoit `handle(Request $request, Closure $next, string ...$roles)` dans `$roles` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ La chaîne `'admin,formateur'`
- ⬜ Le rôle de l'utilisateur connecté
- ✅ Le tableau `['admin', 'formateur']`
- ⬜ Rien : un middleware ne reçoit pas de paramètres

**Explication :** Les paramètres écrits après `:` et séparés par des virgules arrivent après `$next` ; `...$roles` les regroupe dans un tableau.



### Question 8 — Vrai / Faux · 1 point

**Énoncé :** `->middleware('throttle:10,1')` autorise 10 requêtes par minute ; au-delà, Laravel renvoie une erreur 429.

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai. 429 signifie « Too Many Requests » : c'est la limitation de débit.



### Question 9 — Choix unique · 1 point

**Énoncé :** Un apprenant connecté appelle `/api/admin/formations`, protégé par `role:admin,formateur`. Que reçoit-il ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Une erreur 401 : il n'est pas connecté
- ⬜ La liste des formations
- ⬜ Une erreur 419
- ✅ Une erreur 403 : il est connecté, mais n'a pas le droit

**Explication :** 401 : on ne sait pas qui vous êtes. 403 : on sait qui vous êtes, mais vous n'avez pas l'autorisation (ENF-02).



### Question 10 — Choix unique · 1 point

**Énoncé :** Dans PassQuiz, pourquoi applique-t-on `throttle` aux routes de quiz (section 11) ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Pour corriger les quiz plus vite
- ✅ Pour empêcher un script d'envoyer des centaines de requêtes de démarrage ou de soumission
- ⬜ Pour mélanger l'ordre des questions
- ⬜ Pour chronométrer la tentative

**Explication :** Section 11 : « limitation de débit sur les routes de quiz ». Le mélange et le chronomètre sont gérés ailleurs, côté serveur.
