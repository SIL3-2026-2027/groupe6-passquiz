# Fiche de saisie — Les controllers
> À copier dans l'administration PassQuiz (formation **Laravel**). PDF du cours à joindre : **Laravel_Module_03_Controllers_Cours.pdf** · Questions et corrigé : **Laravel_Module_03_Controllers_Questions.pdf**.

## Module

| Champ | Valeur |
|---|---|
| Ordre | 3 |
| Titre | Les controllers |
| Description | Recevoir la demande, travailler avec les Models, renvoyer la bonne réponse. |

## Cours 1 — Créer un controller

| Champ | Valeur |
|---|---|
| Titre | Créer un controller |
| Description | Sortir la logique du fichier des routes. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_03_Controllers_Cours.pdf (à joindre au cours 1 ; ou à chaque cours) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Présentation et création

- **Rôle** : reçoit la demande, appelle les Models, renvoie la réponse
- **Organisation** : un controller **par ressource** (articles, utilisateurs…)
- **Création** : `php artisan make:controller PostController`
- Fichier généré dans `app/Http/Controllers/`

```php
<?php

namespace App\Http\Controllers;

class PostController extends Controller
{
    // les méthodes viennent ici
}
```

> **Pourquoi pas tout dans web.php ?** — Des dizaines de fonctions dans le fichier de routes deviennent illisibles. Le controller regroupe la logique d'une ressource dans une classe.

---

## Cours 2 — Méthodes et données vers la vue

| Champ | Valeur |
|---|---|
| Titre | Méthodes et données vers la vue |
| Description | Une action de l'application = une méthode. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_03_Controllers_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Du controller à la vue

**PostController.php**

```php
public function index()
{
    $posts = Post::all();

    return view('posts.index', [
        'posts' => $posts,
    ]);
}
```

- Le controller **lit** les données avec le Model
- Puis il les **envoie** à la vue

**posts/index.blade.php**

```blade
@foreach ($posts as $post)
  <p>{{ $post->title }}</p>
@endforeach
```

- La clé `'posts'` devient la variable `$posts`
- La vue affiche chaque variable reçue

### Trois façons de passer des données

- Les trois donnent **le même résultat** dans la vue
- `compact('posts')` crée `['posts' => $posts]`
- `index` pour la liste, `show` pour le détail : un nom de méthode par action

```php
// 1. Tableau associatif
return view('posts.index', ['posts' => $posts]);

// 2. compact() : même nom de variable
return view('posts.index', compact('posts'));

// 3. with()
return view('posts.index')->with('posts', $posts);
```

---

## Cours 3 — Paramètres et Request

| Champ | Valeur |
|---|---|
| Titre | Paramètres et Request |
| Description | Récupérer ce qui arrive avec la requête. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_03_Controllers_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Valeur d'adresse ou modèle automatique

**Valeur d'adresse**

```php
// Route::get('/posts/{id}', ...)
public function show($id)
{
    $post = Post::findOrFail($id);
    return view('posts.show',
        compact('article'));
}
```

- La valeur de l'URL arrive en **argument**
- `findOrFail` : **404** automatique si l'id n'existe pas

**Modèle automatique (Route Model Binding)**

```php
// Route::get('/posts/{post}', ...)
public function show(Post $post)
{
    // l'article est déjà chargé
    return view('posts.show',
        compact('article'));
}
```

- Laravel retrouve **lui-même** l'article
- Le nom du paramètre `{post}` doit correspondre à `$post`

### Les données d'un formulaire : Request

- L'objet **Request** contient tout ce qui a été envoyé
- `$request->input('title')` lit un champ
- `validate()` vérifie les règles ; en cas d'échec, retour au formulaire avec les erreurs
- `Post::create()` exige la liste `$fillable` dans le Model
- Après un enregistrement : **redirection**

```php
use Illuminate\Http\Request;

public function store(Request $request)
{
    $titre = $request->input('title');

    // Valider avant d'enregistrer
    $data = $request->validate([
        'title'   => 'required|max:255',
        'content' => 'required',
    ]);

    $post = Post::create($data);

    return redirect()->route('posts.show', $post);
}
```

> **Toujours valider** — Ne jamais enregistrer `$request->all()` sans validation : l'utilisateur peut envoyer n'importe quel champ.

---

## Cours 4 — Resource Controller

| Champ | Valeur |
|---|---|
| Titre | Resource Controller |
| Description | Toutes les méthodes d'un CRUD, générées d'un coup. |
| Durée estimée (minutes) | 20 |
| Ordre du cours dans le module | 4 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_03_Controllers_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Générer et relier un Resource Controller

**Terminal + routes**

```bash
php artisan make:controller PostController -r

# routes/web.php
# Route::resource('posts', PostController::class);
```

- `-r` (ou `--resource`) crée les 7 méthodes
- **Une seule ligne** de route les relie

**Les méthodes générées**

```php
index()    // liste
create()   // formulaire de création
store()    // enregistrer
show()     // détail
edit()     // formulaire de modification
update()   // mettre à jour
destroy()  // supprimer
```

### Options utiles de make:controller

| Commande | Résultat |
|---|---|
| `make:controller PostController` | Classe vide |
| `… -r` / `--resource` | Les 7 méthodes CRUD |
| `… --api` | 5 méthodes, sans `create` ni `edit` (pour une API) |
| `… -r --model=Article` | Méthodes typées avec `Post $post` (Route Model Binding) |

> **Vérifier** — `php artisan route:list` montre chaque route et la méthode qui lui répond.

### Application PassQuiz — le FormationController de l'API

Généré avec `php artisan make:controller FormationController --api --model=Formation`.

- Une API renvoie du **JSON**, pas une vue
- EF-05 : seules les formations **publiées** sont visibles
- Route Model Binding : `Formation $formation`
- Formation non publiée → **404**, comme si elle n'existait pas

```php
class FormationController extends Controller
{
    // GET /api/formations
    public function index()
    {
        $formations = Formation::where('statut', 'publie')
            ->withCount('modules')
            ->get();

        return response()->json($formations);
    }

    // GET /api/formations/{formation}
    public function show(Formation $formation)
    {
        abort_if($formation->statut !== 'publie', 404);

        return response()->json(
            $formation->load('modules.cours')
        );
    }
}
```

### À retenir

- Le controller **reçoit, traite, répond**
- Une **méthode par action** (index, show, store…)
- `view('dossier.vue', compact('var'))`
- `Post $post` : Laravel charge le modèle tout seul
- `-r` = 7 méthodes ; `--api` = 5 méthodes

### Pièges à éviter

- Oublier `use App\Models\Post;` ou `use Illuminate\Http\Request;`
- `{id}` dans la route mais `Post $post` dans la méthode : le binding ne marche pas
- `find()` sans vérifier `null` (préférer `findOrFail`)
- Enregistrer sans `validate()`
- Renvoyer une vue au lieu de JSON dans une API

*Module suivant → les vues et Blade*

---
