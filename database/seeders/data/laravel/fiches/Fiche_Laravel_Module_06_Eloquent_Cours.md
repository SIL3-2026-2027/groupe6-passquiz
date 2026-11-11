# Fiche de saisie — Models et Eloquent ORM
> Formation **Laravel**. Cours rédigé par l'équipe (aucune fiche ni PDF de cours fourni) à partir des questions de **Laravel_Module_06_Eloquent_Questions.pdf** et des modules 5 et 7.

## Module

| Champ | Valeur |
|---|---|
| Ordre | 6 |
| Titre | Models et Eloquent ORM |
| Description | Lire et écrire dans la base avec des objets PHP, sans écrire de SQL. |

## Cours 1 — Créer un Model : Eloquent et ses conventions

| Champ | Valeur |
|---|---|
| Titre | Créer un Model : Eloquent et ses conventions |
| Description | Une table = une classe, une ligne = un objet. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | (aucun) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Qu'est-ce qu'Eloquent ?

- **Eloquent** est l'**ORM** de Laravel (Object-Relational Mapping)
- Chaque **table** est représentée par une classe **Model**
- Chaque **ligne** devient un **objet** PHP
- On manipule la base avec des méthodes, **sans écrire de SQL**

```php
// SQL : SELECT * FROM posts WHERE active = 1
$posts = Post::where('active', 1)->get();

// Chaque élément est un objet Post
foreach ($posts as $post) {
    echo $post->title;
}
```

> **Pourquoi un ORM ?** — Le code reste lisible, les requêtes sont protégées contre les injections SQL, et on change de base (MySQL, SQLite…) sans réécrire les requêtes.

### Créer un Model et respecter les conventions

- `php artisan make:model Post -m` : le model **et** sa migration (module 5)
- Fichier généré dans `app/Models/`
- **Convention** : model au **singulier** avec majuscule (`Post`), table au **pluriel** en minuscules (`posts`)
- Si la convention ne marche pas, on précise le nom avec `$table`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    // table « posts » trouvée automatiquement
}

class Cours extends Model
{
    // « Cours » au pluriel ne donne pas « cours » : on précise
    protected $table = 'cours';
}
```

---

## Cours 2 — Lire des données

| Champ | Valeur |
|---|---|
| Titre | Lire des données |
| Description | Tout récupérer, filtrer, trouver un élément. |
| Durée estimée (minutes) | 20 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | (aucun) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Récupérer des enregistrements

- `all()` : toute la table
- `where(...)->get()` : renvoie **toujours une collection** (éventuellement vide)
- `first()` : le **premier** résultat, ou `null`
- `orderBy`, `latest`, `count`… se combinent avant `get()`

```php
$posts = Post::all();                         // tous les articles

$actifs = Post::where('active', 1)            // collection
    ->orderBy('title')
    ->get();

$premier = Post::where('active', 1)->first(); // un objet ou null

$nombre = Post::where('active', 1)->count();  // un nombre
```

### Trouver par identifiant : find ou findOrFail ?

| Méthode | Si l'id n'existe pas |
|---|---|
| `Post::find(999)` | Renvoie `null` |
| `Post::findOrFail(999)` | Déclenche une erreur **404** |

```php
$post = Post::find($id);
if ($post === null) {
    // à gérer soi-même, sinon erreur plus loin
}

// Plus sûr dans un controller
$post = Post::findOrFail($id);
```

> **Rappel** — Avec le Route Model Binding (`show(Post $post)`, module 3), Laravel fait le `findOrFail` pour vous.

---

## Cours 3 — Créer, modifier et supprimer

| Champ | Valeur |
|---|---|
| Titre | Créer, modifier et supprimer |
| Description | Écrire dans la base en toute sécurité. |
| Durée estimée (minutes) | 25 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | (aucun) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Créer, modifier, supprimer

- `new` + `save()` : champ par champ
- `create([...])` : en une ligne (assignation de masse)
- `update([...])` : modifier ; `delete()` : supprimer
- `all()`, `get()`, `find()` ne font que **lire**

```php
// Créer
$post = new Post();
$post->title = 'Bonjour';
$post->save();

$post = Post::create(['title' => 'Bonjour', 'content' => '…']);

// Modifier
$post->title = 'Nouveau titre';
$post->save();
// ou
$post->update(['title' => 'Nouveau titre']);

// Supprimer
$post->delete();
```

### $fillable : se protéger de l'assignation de masse

- `create()` et `update()` n'acceptent que les champs listés dans `$fillable`
- Les autres champs envoyés sont **ignorés** : un visiteur ne peut pas ajouter `role=admin`
- `$guarded = []` autorise **tout** : dangereux avec `$request->all()`

```php
class Post extends Model
{
    protected $fillable = ['title', 'content', 'active'];
}

// Dangereux : tout champ envoyé serait accepté
// protected $guarded = [];
// User::create($request->all());

// Sûr : valider, puis créer avec les seules données vérifiées
$data = $request->validate(['title' => 'required|max:255']);
Post::create($data);
```

### $casts : convertir automatiquement les colonnes

- `$casts` indique le **type PHP** d'une colonne
- `'datetime'` → objet date (Carbon) ; `'boolean'` → `true` / `false`

```php
class ProgressionCours extends Model
{
    protected $table = 'progression_cours';

    protected $casts = [
        'termine_le' => 'datetime',
    ];
}

$p->termine_le->format('d/m/Y'); // 25/09/2026
```

### Application PassQuiz — la tentative de quiz

Section 11 du cahier : chronométrage et correction côté serveur.

- Model `Tentative` avec `$fillable` et `$casts`
- L'heure de début vient du **serveur** (`now()`), jamais du navigateur
- `reussi` converti en booléen, `debut` / `fin` en dates

```php
class Tentative extends Model
{
    protected $fillable = ['user_id', 'quiz_id', 'debut', 'fin', 'score', 'reussi'];

    protected $casts = [
        'debut'  => 'datetime',
        'fin'    => 'datetime',
        'reussi' => 'boolean',
    ];
}

// TentativeController@demarrer
$tentative = Tentative::create([
    'user_id' => $request->user()->id,
    'quiz_id' => $quiz->id,
    'debut'   => now(), // heure du serveur : impossible à falsifier
]);
```

### À retenir

- Eloquent = ORM : une table = un Model, une ligne = un objet
- Model au singulier, table au pluriel ; sinon `$table`
- `get()` → collection ; `first()` / `find()` → objet ou `null` ; `findOrFail()` → 404
- `create`, `update`, `save`, `delete` écrivent dans la base
- `$fillable` protège l'assignation de masse ; `$casts` convertit les types

### Pièges à éviter

- `$guarded = []` avec `$request->all()` (n'importe quel champ accepté)
- Utiliser `find()` sans vérifier `null`
- Attendre un objet de `get()` (c'est une collection)
- Oublier `$table` quand le pluriel n'est pas régulier (`cours`)
- Prendre l'heure envoyée par le navigateur au lieu de `now()`

*Module suivant → les relations entre les Models*

---
