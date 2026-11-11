# Fiche de saisie — Questions du module 6 : Models et Eloquent ORM
> Retranscrit depuis **Laravel_Module_06_Eloquent_Questions.pdf** (questions et corrigé).

## Quiz — Module 6 : Models et Eloquent ORM

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Qu'est-ce qu'Eloquent ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Un middleware
- ⬜ Un outil de déploiement
- ⬜ Le moteur de templates de Laravel
- ✅ L'ORM de Laravel : on manipule la base avec des objets, sans écrire de SQL

**Explication :** Chaque ligne devient un objet PHP et chaque table est représentée par une classe Model.



### Question 2 — Choix unique · 1 point

**Énoncé :** Par convention, à quelle table est lié le model `Post` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `Post`
- ⬜ `post`
- ✅ `posts`
- ⬜ `tbl_post`

**Explication :** Le model est au singulier et la table au pluriel, en minuscules. Sinon, on précise `$table`.



### Question 3 — Choix unique · 1 point

**Énoncé :** Que renvoie `Post::where('active', 1)->get()` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Le nombre de posts
- ⬜ `true` ou `false`
- ✅ Une collection de Posts (éventuellement vide)
- ⬜ Un seul objet Post

**Explication :** `get()` renvoie toujours une collection. Pour un seul résultat, on utilise `first()`.



### Question 4 — Choix unique · 1 point

**Énoncé :** Que renvoie `Post::find(999)` si l'id 999 n'existe pas ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Le dernier post
- ⬜ Un Post vide
- ⬜ Une erreur 404
- ✅ `null`

**Explication :** `find` renvoie `null` ; c'est `findOrFail` qui déclenche une 404.



### Question 5 — Choix multiple · 1 point

**Énoncé :** Quelles méthodes modifient ou suppriment des données ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `Post::all()`
- ✅ `$post->update([...])`
- ✅ `$post->delete()`
- ✅ `$post->save()`

**Explication :** `all()` ne fait que lire.



### Question 6 — Choix unique · 1 point

**Énoncé :** À quoi sert `$fillable` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ À cacher des champs en JSON
- ⬜ À lister les colonnes de la table
- ✅ À lister les champs autorisés lors d'une assignation de masse (`create`, `update`)
- ⬜ À rendre des champs obligatoires

**Explication :** Les champs absents de `$fillable` sont ignorés ou refusés. Cela protège contre l'ajout de champs non prévus, comme `role`.



### Question 7 — Vrai / Faux · 1 point

**Énoncé :** `$guarded = []` combiné à `User::create($request->all())` est une pratique sûre.

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Vrai
- ✅ Faux

**Explication :** Faux. Tout champ envoyé serait accepté, par exemple `role=admin`. Il faut valider et lister les champs.



### Question 8 — Choix unique · 1 point

**Énoncé :** Quelle propriété indique le nom de table quand la convention ne marche pas ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `$name`
- ✅ `$table`
- ⬜ `$fillable`
- ⬜ `$casts`

**Explication :** Exemple : `protected $table = 'cours';` pour le model `Cours`.



### Question 9 — Choix unique · 1 point

**Énoncé :** Que permet `protected $casts = ['termine_le' => 'datetime'];` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ De convertir automatiquement la valeur en objet date
- ⬜ De l'indexer
- ⬜ De rendre la colonne obligatoire
- ⬜ De supprimer la colonne

**Explication :** On peut alors écrire `$p->termine_le->format('d/m/Y')`.



### Question 10 — Vrai / Faux · 1 point

**Énoncé :** Dans PassQuiz, l'heure de début d'une tentative doit venir du serveur (`now()`), pas du navigateur.

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai. Section 11 : le chronométrage se fait côté serveur, car une heure envoyée par le client pourrait être falsifiée.
