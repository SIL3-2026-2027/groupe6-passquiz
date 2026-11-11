# Fiche de saisie — Formulaires et validation
> À copier dans l'administration PassQuiz (formation **Laravel**). PDF du cours à joindre : **Laravel_Module_08_Formulaires_Validation_Cours.pdf** · Questions et corrigé : **Laravel_Module_08_Formulaires_Validation_Questions.pdf**.

## Module

| Champ | Valeur |
|---|---|
| Ordre | 8 |
| Titre | Formulaires et validation |
| Description | Recevoir des données de l'utilisateur, les vérifier et afficher les erreurs. |

## Cours 1 — Créer et protéger un formulaire

| Champ | Valeur |
|---|---|
| Titre | Créer et protéger un formulaire |
| Description | GET pour lire, POST pour envoyer. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_08_Formulaires_Validation_Cours.pdf (à joindre au cours 1 ; ou à chaque cours) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Un formulaire Blade

- **GET** : lire ou rechercher (paramètres visibles dans l'URL)
- **POST** : envoyer des données qui modifient la base
- L'attribut **name** devient la clé côté PHP
- `action` : utiliser une **route nommée**

```blade
{{-- resources/views/posts/create.blade.php --}}
<form method="POST" action="{{ route('posts.store') }}">
  @csrf

  <label for="title">Titre</label>
  <input type="text" id="title" name="title">

  <button>Enregistrer</button>
</form>

{{-- Recherche : GET, pas besoin de @csrf --}}
<form method="GET" action="{{ route('posts.index') }}">
  <input type="search" name="q">
</form>
```

### La protection CSRF

- **CSRF** (Cross-Site Request Forgery) : un site piégé envoie un formulaire **à votre place**, avec votre session
- `@csrf` ajoute un **jeton caché** que seul votre site connaît
- Laravel vérifie ce jeton sur chaque POST, PUT, PATCH, DELETE
- Jeton absent ou expiré → erreur **419** « Page Expired »

> **Obligatoire** — Tout formulaire POST d'une page Blade doit contenir `@csrf`. (Une API avec jeton Sanctum Bearer n'en a pas besoin.)

---

## Cours 2 — Récupérer et valider les données

| Champ | Valeur |
|---|---|
| Titre | Récupérer et valider les données |
| Description | Ne jamais faire confiance à ce qui arrive du navigateur. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_08_Formulaires_Validation_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Lire puis valider

- `input()`, `only()` : lire les valeurs
- `validate()` : vérifie les règles et **renvoie les données valides**
- En cas d'échec : **retour au formulaire** avec les messages
- `with('success', …)` : message flash pour la page suivante

```php
public function store(Request $request)
{
    $title = $request->input('title');      // un champ
    $all   = $request->only(['title', 'email']);

    $data = $request->validate([
        'title' => 'required|max:255',
        'email' => 'required|email',
    ]);

    Post::create($data);   // seulement les champs validés

    return redirect()->route('posts.index')
        ->with('success', 'Article créé !');
}
```

### Les règles de validation courantes

| Règle | Signification |
|---|---|
| `required` | Obligatoire |
| `nullable` | Peut être vide |
| `string` / `integer` / `boolean` | Type attendu |
| `min:8` / `max:255` | Longueur (texte) ou valeur (nombre) minimale / maximale |
| `email` | Adresse e-mail valide |
| `unique:users,email` | N'existe pas déjà dans la table `users` |
| `exists:formations,id` | Existe dans la table |
| `confirmed` | Identique au champ `password_confirmation` |
| `in:admin,formateur,apprenant` | Fait partie de la liste |

---

## Cours 3 — Afficher les erreurs

| Champ | Valeur |
|---|---|
| Titre | Afficher les erreurs |
| Description | Dire précisément ce qui ne va pas, sans perdre la saisie. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_08_Formulaires_Validation_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### @error et old()

- **@error('champ')** : bloc affiché si ce champ a une erreur, avec `$message`
- **old('champ')** : remet la valeur saisie après l'échec
- `$errors` : toutes les erreurs, disponible dans toutes les vues
- Messages en français : paquet `laravel-lang` ou `lang/fr/validation.php`

```blade
<input type="text" name="title"
       value="{{ old('title') }}"
       class="@error('title') is-invalid @enderror">

@error('title')
  <p class="erreur">{{ $message }}</p>
@enderror

{{-- Toutes les erreurs --}}
@if ($errors->any())
  <ul>
    @foreach ($errors->all() as $e)
      <li>{{ $e }}</li>
    @endforeach
  </ul>
@endif
```

### Application PassQuiz — valider l'inscription (EF-01)

E-mail unique, mot de passe ≥ 8 caractères, rôle apprenant.

- `unique:users,email` : un compte par e-mail
- `min:8|confirmed` : règle du cahier
- Le rôle n'est **pas** lu dans la requête : forcé à `apprenant`
- API : en cas d'échec, Laravel répond **422** en JSON, que React affiche

```php
// AuthController@register
public function register(Request $request)
{
    $data = $request->validate([
        'nom'      => 'required|string|max:100',
        'email'    => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $user = User::create([
        'nom'          => $data['nom'],
        'email'        => $data['email'],
        'mot_de_passe' => Hash::make($data['password']),
        'role'         => 'apprenant',   // jamais depuis la requête
    ]);

    return response()->json($user, 201);
}
```

### À retenir

- GET pour lire, POST pour envoyer
- `@csrf` protège contre les envois falsifiés
- `$request->validate([...])` renvoie les données sûres
- `@error` + `$message` et `old()` dans la vue
- Règles : required, max, email, unique, confirmed…

### Pièges à éviter

- Oublier `@csrf` : erreur 419
- Enregistrer `$request->all()` au lieu des données validées
- Oublier `name` sur un champ : la valeur n'arrive jamais
- Ne pas remettre `old()` : l'utilisateur ressaisit tout
- Laisser le client choisir son rôle

*Module suivant → le CRUD avec Laravel*

---
