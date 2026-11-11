# Fiche de saisie — L'authentification
> Formation **Laravel**. Retranscrit depuis **Laravel_Module_10_Authentification_Cours.pdf** (PDF du cours à joindre) · Questions et corrigé : **Laravel_Module_10_Authentification_Questions.pdf**.

## Module

| Champ | Valeur |
|---|---|
| Ordre | 10 |
| Titre | L'authentification |
| Description | Inscription, connexion, mots de passe et pages réservées aux utilisateurs connectés. |

## Cours 1 — Inscription, connexion et mots de passe

| Champ | Valeur |
|---|---|
| Titre | Inscription, connexion et mots de passe |
| Description | Vérifier qui est l'utilisateur avant de lui donner accès. |
| Durée estimée (minutes) | 25 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_10_Authentification_Cours.pdf (à joindre au cours 1 ; ou à chaque cours) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Authentification ou autorisation ?

| | Authentification | Autorisation |
|---|---|---|
| Question | **QUI** es-tu ? | **AS-TU LE DROIT** ? |
| Exemple | Connexion avec e-mail + mot de passe | Cet utilisateur peut-il modifier cette formation ? |
| Résultat / outils | L'utilisateur est identifié | Middleware, rôles, Gates, Policies |
| Où | Ce module | Modules 11 et 12 |

### Un starter kit : Breeze

- Installe en quelques commandes : inscription, connexion, déconnexion, mot de passe oublié, profil
- Génère routes, controllers et vues Blade
- Idéal pour un site Laravel « classique » (Blade)

```bash
composer require laravel/breeze --dev
php artisan breeze:install
npm install && npm run dev
php artisan migrate
```

> **Laravel 12** — Les nouveaux projets proposent des starter kits (React, Vue, Livewire) via `laravel new`. Breeze reste installable avec Composer pour apprendre.

### Mots de passe : toujours hachés

- **Jamais** de mot de passe en clair dans la base
- Le hachage est **à sens unique** : on ne peut pas le « décoder »
- `Hash::check` compare une saisie avec le hash
- `Auth::attempt` fait la vérification + ouvre la session

```php
use Illuminate\Support\Facades\Hash;

// À l'inscription
$user->password = Hash::make($mdp);
// $2y$12$Kq... (bcrypt, irréversible)

// À la connexion (vérification manuelle)
if (Hash::check($mdpSaisi, $user->password)) {
    // mot de passe correct
}

// Le plus simple : Auth::attempt
if (Auth::attempt(['email' => $email, 'password' => $mdp])) {
    $request->session()->regenerate();
    return redirect()->intended('/dashboard');
}
```

> **Pourquoi hacher ?** — Si la base fuite, l'attaquant n'obtient pas les mots de passe (que beaucoup réutilisent ailleurs).

---

## Cours 2 — Protéger les pages et gérer les utilisateurs

| Champ | Valeur |
|---|---|
| Titre | Protéger les pages et gérer les utilisateurs |
| Description | Le middleware auth, et l'utilisateur connecté partout. |
| Durée estimée (minutes) | 20 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_10_Authentification_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Protéger, récupérer, déconnecter

- `->middleware('auth')` : non connecté → redirection vers `/login`
- `Auth::user()` : l'utilisateur connecté, à tout moment
- `Auth::logout()` + invalider la session
- `@auth` / `@guest` dans les vues

```php
// routes/web.php : réservé aux connectés
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('auth');

// Dans un controller
$user = Auth::user(); $id = Auth::id();
// ou $request->user()

// Déconnexion
Auth::logout();
$request->session()->invalidate();
$request->session()->regenerateToken();
```

```blade
{{-- Dans une vue --}}
@auth
    Bonjour {{ Auth::user()->name }}
@endauth

@guest
    <a href="{{ route('login') }}">Connexion</a>
@endguest
```

---

## Cours 3 — Authentification d'une API : Sanctum

| Champ | Valeur |
|---|---|
| Titre | Authentification d'une API : Sanctum |
| Description | Pas de session côté React : un jeton à chaque requête. |
| Durée estimée (minutes) | 30 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_10_Authentification_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Session ou jeton ?

| | Site Blade : session | API (React, mobile) : jeton |
|---|---|---|
| Principe | Le navigateur garde un cookie de session | Le client envoie `Authorization: Bearer <jeton>` |
| Protection | Formulaires protégés par `@csrf` | Sanctum crée et vérifie les jetons |
| Middleware | `auth` | `auth:sanctum` |

- Installation : `php artisan install:api`

### Application PassQuiz — connexion et déconnexion (EF-02)

Identifiants valides → jeton ; jeton révoqué à la déconnexion.

- Le model `User` utilise le trait `HasApiTokens`
- Compte désactivé par l'admin (`actif`) → refus
- Même message pour e-mail inconnu ou mauvais mot de passe
- Déconnexion : `currentAccessToken()->delete()` révoque le jeton

```php
// User.php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable { use HasApiTokens; }

// AuthController
public function login(Request $request)
{
    $data = $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $data['email'])->first();

    if (! $user || ! Hash::check($data['password'], $user->mot_de_passe)) {
        return response()->json(['message' => 'Identifiants invalides'], 401);
    }

    abort_unless($user->actif, 403, 'Compte désactivé.');

    $token = $user->createToken('passquiz')->plainTextToken;

    return response()->json(['user' => $user, 'token' => $token]);
}

public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();

    return response()->noContent();
}
```

### À retenir

- Authentification = qui ; autorisation = le droit
- Breeze : inscription / connexion prêtes
- `Hash::make` / `Hash::check`, ou `Auth::attempt`
- `middleware('auth')`, `Auth::user()`, `@auth`
- API : jetons Sanctum + `auth:sanctum`

### Pièges à éviter

- Stocker un mot de passe en clair
- Message d'erreur qui révèle si l'e-mail existe
- Oublier `->middleware('auth')` sur une page privée
- Déconnexion sans invalider la session / révoquer le jeton
- Oublier le trait `HasApiTokens` (erreur sur `createToken`)

*Module suivant → les middleware*

---
