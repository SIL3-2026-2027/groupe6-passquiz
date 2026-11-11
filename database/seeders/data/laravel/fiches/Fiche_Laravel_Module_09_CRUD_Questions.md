# Fiche de saisie — Questions du module 9 : Le CRUD avec Laravel
> Retranscrit depuis **Laravel_Module_09_CRUD_Questions.pdf** (questions et corrigé).

## Quiz — Module 9 : Le CRUD avec Laravel

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix multiple · 1 point

**Énoncé :** Que signifie CRUD ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Create
- ⬜ Upload
- ✅ Delete
- ✅ Read

**Explication :** Create, Read, Update, Delete.



### Question 2 — Choix unique · 1 point

**Énoncé :** Quelle méthode du Resource Controller enregistre un nouvel article ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `update`
- ✅ `store`
- ⬜ `edit`
- ⬜ `create`

**Explication :** `create` affiche le formulaire. `store` reçoit le POST et enregistre.



### Question 3 — Choix unique · 1 point

**Énoncé :** Pourquoi rediriger après un `store` réussi ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ C'est obligatoire en PHP
- ⬜ Pour supprimer la session
- ⬜ Pour vider le cache
- ✅ Pour éviter qu'un rafraîchissement renvoie le formulaire une deuxième fois

**Explication :** C'est le principe Post/Redirect/Get : la page affichée après l'envoi est une simple page GET.



### Question 4 — Choix unique · 1 point

**Énoncé :** Comment préremplir le champ titre du formulaire d'édition, en gardant la saisie après une erreur ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `value="title"`
- ⬜ `value="{{ $post->title }}"`
- ✅ `value="{{ old('title', $post->title) }}"`
- ⬜ `value="{{ old('title') }}"`

**Explication :** `old()` prend la saisie précédente si elle existe, sinon la valeur par défaut (`$post->title`).



### Question 5 — Choix unique · 1 point

**Énoncé :** Quel est le problème de `$post->update($request->all())` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Les données ne sont pas validées : n'importe quel champ envoyé peut être enregistré
- ⬜ Il supprime le post
- ⬜ Aucun
- ⬜ Il ne fonctionne pas avec PUT

**Explication :** On met à jour avec `$request->validate(...)`, ou au minimum avec `$fillable` bien défini.



### Question 6 — Vrai / Faux · 1 point

**Énoncé :** Un simple lien `<a href="/posts/1/delete">` est une bonne façon de supprimer un article.

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Vrai
- ✅ Faux

**Explication :** Faux. Un GET ne doit jamais modifier de données (robots, préchargement des liens). On utilise un formulaire POST avec `@method('DELETE')` et `@csrf`.



### Question 7 — Choix unique · 1 point

**Énoncé :** Que fait `Post::latest()->paginate(10)` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Renvoie 10 pages
- ⬜ Supprime les anciens articles
- ⬜ Renvoie les 10 premiers articles uniquement
- ✅ Découpe la liste en pages de 10, triées du plus récent au plus ancien

**Explication :** Le numéro de page est lu dans `?page=`, et `{{ $posts->links() }}` affiche la navigation.



### Question 8 — Choix unique · 1 point

**Énoncé :** Quelle condition trouve les articles dont le titre CONTIENT « laravel » ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `where('title', 'like', '%laravel%')`
- ⬜ `where('title', '=', '%laravel%')`
- ⬜ `find('laravel')`
- ⬜ `where('title', 'laravel')`

**Explication :** `%` remplace n'importe quelle suite de caractères avec `like`.



### Question 9 — Choix unique · 1 point

**Énoncé :** À quoi sert `->withQueryString()` après `paginate()` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ À compter les pages
- ⬜ À trier les résultats
- ⬜ À chiffrer l'URL
- ✅ À conserver les paramètres actuels (ex. `?q=`) dans les liens de pagination

**Explication :** Sinon, la recherche serait perdue en passant à la page 2.



### Question 10 — Choix unique · 1 point

**Énoncé :** Dans PassQuiz, quel statut a une formation créée par un formateur ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Aucun
- ✅ `brouillon`, puis l'admin la publie
- ⬜ `archive`
- ⬜ `publie`

**Explication :** Sections 4.1 et 4.2 : l'admin valide et publie. EF-05 : seules les formations publiées sont visibles.
