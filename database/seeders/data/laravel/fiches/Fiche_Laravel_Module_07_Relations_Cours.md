# Fiche de saisie — Relations entre les Models
> Formation **Laravel**. Retranscrit depuis **Laravel_Module_07_Relations_Cours.pdf** (PDF du cours à joindre) · Questions et corrigé : **Laravel_Module_07_Relations_Questions.pdf**.

## Module

| Champ | Valeur |
|---|---|
| Ordre | 7 |
| Titre | Relations entre les Models |
| Description | Relier les tables : un-à-un, un-à-plusieurs, plusieurs-à-plusieurs. |

## Cours 1 — One to One

| Champ | Valeur |
|---|---|
| Titre | One to One |
| Description | Un model accède aux données d'un autre. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_07_Relations_Cours.pdf (à joindre au cours 1 ; ou à chaque cours) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Un utilisateur a un seul profil

**User.php**

```php
public function profile()
{
    return $this->hasOne(Profile::class);
}
```

- `hasOne` : dans le model qui « possède »

**Profile.php**

```php
public function user()
{
    return $this->belongsTo(User::class);
}
```

- `belongsTo` : dans le model qui contient la clé étrangère `user_id`

> **Utilisation** — `$user->profile->bio` · `$profile->user->name` : on appelle la relation comme une propriété, Eloquent fait la requête.

---

## Cours 2 — One to Many

| Champ | Valeur |
|---|---|
| Titre | One to Many |
| Description | La relation la plus courante. |
| Durée estimée (minutes) | 20 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_07_Relations_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Un utilisateur possède plusieurs articles

- `hasMany` : dans le model **parent**
- `belongsTo` : dans le model **enfant** (qui a la clé étrangère)
- `$user->posts` (propriété) → résultat ; `$user->posts()` (méthode) → requête à compléter
- Créer via la relation remplit automatiquement `user_id`

```php
// User.php (parent)
public function posts()
{
    return $this->hasMany(Post::class);
}

// Post.php (enfant, contient user_id)
public function user()
{
    return $this->belongsTo(User::class);
}

// Utilisation
$user->posts;                                   // collection de ses articles
$post->user->name;                              // son auteur
$user->posts()->count();                        // requête : nombre d'articles
$user->posts()->create(['title' => 'Nouveau']); // user_id rempli
```

---

## Cours 3 — Many to Many et Eager Loading

| Champ | Valeur |
|---|---|
| Titre | Many to Many et Eager Loading |
| Description | Une table pivot, et des requêtes groupées. |
| Durée estimée (minutes) | 30 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_07_Relations_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Many to Many et table pivot

- Un article a plusieurs tags ; un tag est sur plusieurs articles
- La **table pivot** relie les deux (`post_tag` : noms au singulier, ordre alphabétique)
- `belongsToMany` des deux côtés
- `attach`, `detach`, `sync` gèrent les lignes de la pivot

```php
// php artisan make:migration create_post_tag_table
Schema::create('post_tag', function (Blueprint $t) {
    $t->foreignId('post_id')->constrained()->cascadeOnDelete();
    $t->foreignId('tag_id')->constrained()->cascadeOnDelete();
    $t->primary(['post_id', 'tag_id']);
});

// Post.php
public function tags()
{
    return $this->belongsToMany(Tag::class);
}

// Attacher / détacher / synchroniser
$post->tags()->attach([1, 3]);
$post->tags()->detach(3);
$post->tags()->sync([1, 2]);
```

### Eager Loading : le problème N+1

**Sans : 1 + N requêtes**

```php
$posts = Post::all();               // 1 requête
foreach ($posts as $post) {
    echo $post->user->name;         // +1 par article !
}
// 100 articles = 101 requêtes
```

- Chaque accès à `->user` déclenche une requête

**Avec : quelques requêtes**

```php
$posts = Post::with('user', 'tags')->get();
foreach ($posts as $post) {
    echo $post->user->name;         // déjà chargé
}
// 100 articles = 3 requêtes
```

- `with()` charge les relations en avance
- Sur un objet déjà chargé : `$post->load('tags')`

### Application PassQuiz — la chaîne Formation → Module → Cours

Le MCD de la section 9, en relations Eloquent.

- Formation `hasMany` Module, Module `hasMany` Cours
- Inscription = `belongsToMany` avec la table `inscriptions`
- `with('modules.cours')` : tout le programme en 3 requêtes
- EF-10 : progression = cours terminés ÷ total × 100

```php
// Formation.php
public function modules()
{
    return $this->hasMany(Module::class)->orderBy('ordre');
}

public function cours() // à travers les modules
{
    return $this->hasManyThrough(Cours::class, Module::class);
}

public function apprenants()
{
    return $this->belongsToMany(User::class, 'inscriptions')
        ->withTimestamps();
}

// Module.php
public function cours()
{
    return $this->hasMany(Cours::class)->orderBy('ordre');
}

// ProgressionController : EF-10
$total = $formation->cours()->count();
$faits = ProgressionCours::where('user_id', $user->id)
    ->whereIn('cours_id', $formation->cours()->pluck('cours.id'))
    ->count();
$pourcentage = $total ? round($faits / $total * 100) : 0;
```

### À retenir

- One to One : `hasOne` / `belongsTo`
- One to Many : `hasMany` (parent) / `belongsTo` (enfant)
- Many to Many : `belongsToMany` + table pivot
- `attach`, `detach`, `sync` sur la pivot
- Eager Loading : `with()` pour éviter N+1

### Pièges à éviter

- Mettre `hasMany` du côté de la table qui contient la clé étrangère
- Confondre `$user->posts` (résultat) et `$user->posts()` (requête)
- Boucle sur des relations sans `with()` : problème N+1
- Table pivot mal nommée (`tags_posts`) sans la préciser
- Oublier la clé étrangère dans la migration

*Module suivant → formulaires et validation*

---
