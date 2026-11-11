# Fiche de saisie — L'autorisation : Gates et Policies
> Formation **Laravel**. Module rédigé par l'équipe (aucune fiche ni PDF fourni), dans la suite du module 10 (« Autorisation : middleware, rôles, Gates, Policies »).

## Module

| Champ | Valeur |
|---|---|
| Ordre | 12 |
| Titre | L'autorisation : Gates et Policies |
| Description | Décider qui a le droit de faire quoi, ressource par ressource. |

## Cours 1 — Les Gates

| Champ | Valeur |
|---|---|
| Titre | Les Gates |
| Description | Une règle d'autorisation, écrite une seule fois. |
| Durée estimée (minutes) | 20 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | (aucun) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Middleware ou autorisation fine ?

- Le **middleware** `role` (module 11) contrôle l'accès à **tout un groupe** de routes
- Mais « ce formateur peut-il modifier **cette** formation ? » dépend de la **ressource**
- Les **Gates** et les **Policies** répondent à cette question

> **Rappel** — Authentification : QUI es-tu ? Autorisation : AS-TU LE DROIT ? (module 10)

### Définir une Gate

- Une **Gate** est une règle nommée : une fonction qui renvoie `true` ou `false`
- On la définit dans `AppServiceProvider`, méthode `boot()`
- Le premier paramètre est **toujours** l'utilisateur connecté

```php
// app/Providers/AppServiceProvider.php
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::define('voir-statistiques', function (User $user) {
        return $user->role === 'admin';
    });

    Gate::define('modifier-post', function (User $user, Post $post) {
        return $user->id === $post->user_id;
    });
}
```

### Utiliser une Gate

| Écriture | Résultat |
|---|---|
| `Gate::allows('modifier-post', $post)` | `true` si autorisé |
| `Gate::denies('modifier-post', $post)` | `true` si refusé |
| `Gate::authorize('modifier-post', $post)` | Erreur **403** si refusé |
| `@can('modifier-post', $post)` … `@endcan` | Bloc affiché seulement si autorisé |

```php
public function edit(Post $post)
{
    Gate::authorize('modifier-post', $post); // 403 sinon

    return view('posts.edit', compact('post'));
}
```

```blade
@can('modifier-post', $post)
    <a href="{{ route('posts.edit', $post) }}">Modifier</a>
@endcan
```

---

## Cours 2 — Les Policies

| Champ | Valeur |
|---|---|
| Titre | Les Policies |
| Description | Toutes les règles d'une ressource, rangées dans une classe. |
| Durée estimée (minutes) | 25 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | (aucun) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Créer une Policy

- Une **Policy** regroupe les règles d'**un model** : une méthode par action
- `php artisan make:policy PostPolicy --model=Post`
- Fichier généré dans `app/Policies/`
- Laravel trouve la Policy **tout seul** : `Post` → `PostPolicy`

```php
// app/Policies/PostPolicy.php
class PostPolicy
{
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }

    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
```

### Utiliser une Policy

- Même écriture qu'une Gate : le **nom de la méthode** et le **model**
- `Gate::authorize('update', $post)` appelle `PostPolicy::update`
- Dans une vue : `@can('update', $post)`

```php
// PostController
public function update(Request $request, Post $post)
{
    Gate::authorize('update', $post); // 403 si ce n'est pas son article

    $post->update($request->validate(['title' => 'required|max:255']));

    return redirect()->route('posts.show', $post);
}
```

```blade
@can('delete', $post)
    <form method="POST" action="{{ route('posts.destroy', $post) }}">
        @csrf @method('DELETE')
        <button>Supprimer</button>
    </form>
@endcan
```

### before() : l'administrateur a tous les droits

- `before()` est appelée **avant** chaque méthode de la Policy
- `true` : autorisé sans regarder la suite ; `null` : on continue normalement

```php
public function before(User $user, string $ability): ?bool
{
    return $user->role === 'admin' ? true : null;
}
```

> **Gate ou Policy ?** — Gate : une règle isolée (« voir les statistiques »). Policy : les règles d'un model (voir, modifier, supprimer un `Post`).

---

## Cours 3 — Application PassQuiz : qui gère quoi ?

| Champ | Valeur |
|---|---|
| Titre | Application PassQuiz : qui gère quoi ? |
| Description | Les rôles du cahier des charges, traduits en Policies. |
| Durée estimée (minutes) | 25 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | (aucun) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Les règles des sections 4.1 et 4.2

- Le **formateur** gère **ses** formations, modules, cours et quiz (`formateur_id`)
- L'**administrateur** gère tout, et il est le seul à **publier** une formation
- L'**apprenant** ne télécharge que **ses** certificats

### La FormationPolicy

```php
// php artisan make:policy FormationPolicy --model=Formation
class FormationPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->role === 'admin' ? true : null;
    }

    public function update(User $user, Formation $formation): bool
    {
        return $user->role === 'formateur'
            && $formation->formateur_id === $user->id;
    }

    public function delete(User $user, Formation $formation): bool
    {
        return $this->update($user, $formation);
    }

    public function publier(User $user, Formation $formation): bool
    {
        return false; // seul l'admin publie (géré par before)
    }
}
```

### Dans le controller de l'API

```php
// Admin\FormationController
public function store(Request $request)
{
    $data = $request->validate([
        'titre'       => 'required|max:255',
        'description' => 'nullable',
    ]);

    $formation = Formation::create([
        ...$data,
        'formateur_id' => $request->user()->id,
        'statut'       => 'brouillon', // l'admin publiera
    ]);

    return response()->json($formation, 201);
}

public function update(Request $request, Formation $formation)
{
    Gate::authorize('update', $formation); // 403 si ce n'est pas la sienne

    $formation->update($request->validate(['titre' => 'required|max:255']));

    return response()->json($formation);
}

public function publier(Formation $formation)
{
    Gate::authorize('publier', $formation);

    $formation->update(['statut' => 'publie']);

    return response()->json($formation);
}
```

- La route admin est déjà filtrée par `role:admin,formateur` (module 11)
- La Policy ajoute la règle fine : **sa** formation
- La liste aussi est filtrée : `Formation::where('formateur_id', $user->id)` pour un formateur

### À retenir

- Middleware : accès à un groupe de routes ; Gate / Policy : droit sur **une** ressource
- `Gate::define` dans `AppServiceProvider` ; Policy = une classe par model
- `Gate::allows`, `Gate::denies`, `Gate::authorize` (403), `@can`
- `make:policy … --model=…`, découverte automatique
- `before()` : donner tous les droits à l'admin

### Pièges à éviter

- Vérifier le droit seulement dans la vue (`@can`) : l'API reste ouverte
- Oublier `Gate::authorize` dans `update` ou `destroy`
- Comparer des identifiants de types différents (`'3' === 3` est faux)
- `before()` qui renvoie `false` au lieu de `null` : plus personne n'a de droit
- Se fier au `formateur_id` envoyé par le client au lieu de `$request->user()->id`

*Fin du programme des modules : place à l'évaluation finale.*

---
