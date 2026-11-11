# Fiche de saisie — Le CRUD avec Laravel
> À copier dans l'administration PassQuiz (formation **Laravel**). PDF du cours à joindre : **Laravel_Module_09_CRUD_Cours.pdf** · Questions et corrigé : **Laravel_Module_09_CRUD_Questions.pdf**.

## Module

| Champ | Valeur |
|---|---|
| Ordre | 9 |
| Titre | Le CRUD avec Laravel |
| Description | Créer, lire, modifier et supprimer : l'application complète, de la route à la vue. |

## Cours 1 — Présentation du CRUD et routes

| Champ | Valeur |
|---|---|
| Titre | Présentation du CRUD et routes |
| Description | Create, Read, Update, Delete. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_09_CRUD_Cours.pdf (à joindre au cours 1 ; ou à chaque cours) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Les 4 opérations et leurs 7 routes

| Opération | Verbe + URL | Méthode | Rôle |
|---|---|---|---|
| Read | GET /posts | `index` | Liste |
| Create | GET /posts/create | `create` | Formulaire de création |
| Create | POST /posts | `store` | Enregistrer |
| Read | GET /posts/{post} | `show` | Détail |
| Update | GET /posts/{post}/edit | `edit` | Formulaire prérempli |
| Update | PUT /posts/{post} | `update` | Mettre à jour |
| Delete | DELETE /posts/{post} | `destroy` | Supprimer |

> **Deux commandes** — `php artisan make:controller PostController --resource --model=Post` puis `Route::resource('posts', PostController::class);`

---

## Cours 2 — Create et Read

| Champ | Valeur |
|---|---|
| Titre | Create et Read |
| Description | Afficher un formulaire, enregistrer, lister. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_09_CRUD_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Create : create() et store()

- `create` : affiche le formulaire (vide)
- `store` : **valide**, enregistre, puis **redirige**
- Redirection après POST : un rafraîchissement ne renvoie pas le formulaire deux fois

```php
public function create()
{
    return view('posts.create');
}

public function store(Request $request)
{
    $data = $request->validate([
        'title'   => 'required|max:255',
        'content' => 'nullable',
    ]);

    Post::create($data);

    return redirect()->route('posts.index')
        ->with('success', 'Article créé.');
}
```

### Read : index() et show()

**PostController**

```php
public function index()
{
    $posts = Post::latest()->get();
    return view('posts.index', compact('posts'));
}

public function show(Post $post)
{
    return view('posts.show', compact('post'));
}
```

- `latest()` : du plus récent au plus ancien
- `show(Post $post)` : chargé par Route Model Binding

**posts/index.blade.php**

```blade
@forelse ($posts as $post)
  <a href="{{ route('posts.show', $post) }}">
    {{ $post->title }}
  </a>
@empty
  <p>Aucun article.</p>
@endforelse
```

- Lien vers le détail avec la **route nommée**

---

## Cours 3 — Update et Delete

| Champ | Valeur |
|---|---|
| Titre | Update et Delete |
| Description | Modifier un formulaire prérempli, supprimer avec confirmation. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_09_CRUD_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Update : edit() et update()

- Formulaire **prérempli** : `old('title', $post->title)`
- `@method('PUT')` : HTML ne connaît que POST
- Valider aussi à la modification

```php
public function edit(Post $post)
{
    return view('posts.edit', compact('post'));
}

public function update(Request $request, Post $post)
{
    $data = $request->validate([
        'title'   => 'required|max:255',
        'content' => 'nullable',
    ]);

    $post->update($data);

    return redirect()->route('posts.index');
}

{{-- posts/edit.blade.php --}}
<form method="POST" action="{{ route('posts.update', $post) }}">
  @csrf @method('PUT')
  <input name="title" value="{{ old('title', $post->title) }}">
</form>
```

> **Pas de $request->all()** — `$post->update($request->all())` accepterait n'importe quel champ envoyé. On met à jour avec les **données validées**.

### Delete : destroy()

**PostController**

```php
public function destroy(Post $post)
{
    $post->delete();

    return back()
        ->with('success', 'Supprimé.');
}
```

- `back()` : retour à la page précédente

**Le bouton (vue)**

```blade
<form method="POST"
      action="{{ route('posts.destroy', $post) }}"
      onsubmit="return confirm('Supprimer ?')">
  @csrf
  @method('DELETE')
  <button>Supprimer</button>
</form>
```

- Jamais de suppression par un simple **lien GET**
- Une confirmation évite les clics accidentels

---

## Cours 4 — Pagination et recherche

| Champ | Valeur |
|---|---|
| Titre | Pagination et recherche |
| Description | Des listes longues, mais lisibles. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 4 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_09_CRUD_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Paginer et filtrer

**PostController@index**

```php
$q = $request->input('q');

$posts = Post::when($q, fn ($query) =>
        $query->where('title', 'like', "%$q%"))
    ->latest()
    ->paginate(10)
    ->withQueryString();
```

- `paginate(10)` : pages de **10 éléments**
- `when($q, …)` : filtre seulement si un mot est saisi
- `withQueryString()` : garde `?q=` dans les liens de pages

**Dans la vue**

```blade
<form method="GET">
  <input name="q" value="{{ request('q') }}">
</form>

@foreach ($posts as $post) … @endforeach

{{ $posts->links() }}
```

- `links()` affiche les numéros de page
- `like "%mot%"` : le titre **contient** le mot

### Application PassQuiz — le CRUD des formations (formateur)

Section 4.2 : le formateur gère SES formations. API → JSON.

- `apiResource` : pas de `create` / `edit` (React affiche les formulaires)
- Chaque formateur ne voit que **ses** formations
- Statut `brouillon` par défaut : l'admin publie (section 4.1)
- Pagination JSON : React reçoit `data`, `links`, `meta`

```php
class Admin\FormationController extends Controller
{
    public function index(Request $request)
    {
        return Formation::where('formateur_id', $request->user()->id)
            ->when($request->q, fn ($q, $mot) =>
                $q->where('titre', 'like', "%$mot%"))
            ->withCount('modules')
            ->paginate(10);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre'       => 'required|max:255',
            'description' => 'nullable',
            'niveau'      => 'required|in:debutant,intermediaire,avance',
        ]);
        $formation = $request->user()->formations()->create(
            $data + ['statut' => 'brouillon']);
        return response()->json($formation, 201);
    }

    public function destroy(Formation $formation)
    {
        $formation->delete();
        return response()->noContent();   // 204
    }
}
```

### À retenir

- CRUD = 7 routes `resource` ↔ 7 méthodes
- store / update : **valider, enregistrer, rediriger**
- Formulaire d'édition prérempli avec `old('x', $post->x)`
- Suppression : formulaire POST + `@method('DELETE')`
- `paginate(10)` + `links()`, recherche avec `like`

### Pièges à éviter

- Supprimer par un lien GET
- `update($request->all())` sans validation
- Oublier `@method('PUT')` / `@method('DELETE')`
- Pas de redirection après un POST (double envoi au rafraîchissement)
- Pagination qui perd le filtre (`withQueryString()`)

*Module suivant → l'authentification*

---
