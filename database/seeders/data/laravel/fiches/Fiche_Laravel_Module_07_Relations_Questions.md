# Fiche de saisie — Questions du module 7 : Relations entre les Models
> Retranscrit depuis **Laravel_Module_07_Relations_Questions.pdf** (questions et corrigé).

## Quiz — Module 7 : Relations entre les Models

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Un utilisateur a un seul profil. Quelle méthode met-on dans `User` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `hasOne(Profile::class)`
- ⬜ `belongsTo(Profile::class)`
- ⬜ `belongsToMany(Profile::class)`
- ⬜ `hasMany(Profile::class)`

**Explication :** Le `User` « possède » un profil, et c'est la table `profiles` qui contient `user_id`.



### Question 2 — Choix unique · 1 point

**Énoncé :** Dans une relation One to Many `User` → `Post`, où place-t-on `belongsTo(User::class)` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Dans le controller
- ⬜ Dans `User`
- ✅ Dans `Post`, le model qui contient la clé étrangère `user_id`
- ⬜ Dans la migration

**Explication :** `belongsTo` se place toujours du côté de la clé étrangère.



### Question 3 — Choix unique · 1 point

**Énoncé :** Quelle est la différence entre `$user->posts` et `$user->posts()` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `posts` ne fonctionne qu'en Blade
- ✅ `posts` donne le résultat (collection) ; `posts()` donne une requête qu'on peut compléter
- ⬜ Aucune
- ⬜ `posts()` est plus lent

**Explication :** Exemple : `$user->posts()->where('active', 1)->count()`.



### Question 4 — Choix multiple · 1 point

**Énoncé :** Pour une relation Many to Many entre `Post` et `Tag`, qu'est-ce qui est nécessaire ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Une colonne `tag_id` dans `posts`
- ✅ Une table pivot `post_tag`
- ✅ Les clés `post_id` et `tag_id` dans la pivot
- ✅ `belongsToMany` dans `Post` et dans `Tag`

**Explication :** Les clés étrangères sont dans la pivot, pas dans `posts`.



### Question 5 — Choix unique · 1 point

**Énoncé :** Que fait `$post->tags()->sync([1, 2])` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Crée deux nouveaux tags
- ✅ Garde exactement les tags 1 et 2 : ajoute ceux qui manquent, retire les autres
- ⬜ Supprime les tags 1 et 2
- ⬜ Ajoute les tags 1 et 2 sans toucher aux autres

**Explication :** `attach` ajoute, `detach` retire, et `sync` fixe la liste exacte.



### Question 6 — Choix unique · 1 point

**Énoncé :** Qu'est-ce que le problème N+1 ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ 1 requête pour la liste, puis 1 requête de plus pour chaque élément quand on accède à sa relation
- ⬜ Une table en trop
- ⬜ Un dépassement de mémoire
- ⬜ Une erreur de clé étrangère

**Explication :** Avec 100 articles, cela fait 101 requêtes. `with()` ramène le tout à quelques requêtes.



### Question 7 — Choix unique · 1 point

**Énoncé :** Comment charger les auteurs en même temps que les articles ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `Post::all('user')`
- ✅ `Post::with('user')->get()`
- ⬜ `Post::load()`
- ⬜ `Post::join('user')`

**Explication :** C'est l'Eager Loading. `load()` s'utilise sur un objet déjà récupéré.



### Question 8 — Vrai / Faux · 1 point

**Énoncé :** `$user->posts()->create([...])` remplit automatiquement la colonne `user_id`.

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai. Créer via la relation renseigne la clé étrangère.



### Question 9 — Choix unique · 1 point

**Énoncé :** Dans PassQuiz, quelle relation relie `Formation` et `Module` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Formation `belongsTo` Module
- ⬜ Formation `belongsToMany` Module
- ⬜ Formation `hasOne` Module
- ✅ Formation `hasMany` Module

**Explication :** MCD : une formation contient plusieurs modules, et la table `modules` porte `formation_id`.



### Question 10 — Choix unique · 1 point

**Énoncé :** Comment récupérer une formation avec ses modules et leurs cours, en évitant N+1 ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `Module::with('formation')`
- ⬜ `Formation::find($id)->modules->cours`
- ✅ `Formation::with('modules.cours')->find($id)`
- ⬜ `Formation::all('cours')`

**Explication :** La notation à point charge les relations imbriquées.
