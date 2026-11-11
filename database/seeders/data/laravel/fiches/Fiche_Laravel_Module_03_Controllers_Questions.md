# Fiche de saisie — Questions du module 3 : Les controllers
> À copier dans l'administration PassQuiz (quiz du module). PDF correspondant : **Laravel_Module_03_Controllers_Questions.pdf**.

## Quiz — Module 3 : Les controllers

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Quel est le rôle d'un controller ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Recevoir la demande, appeler les Models et renvoyer la réponse
- ⬜ Configurer la base de données
- ⬜ Définir la structure des tables
- ⬜ Afficher le HTML

**Explication :** C'est le « C » de MVC : il fait le lien entre la requête, les données (Model) et l'affichage (Vue).



### Question 2 — Choix unique · 1 point

**Énoncé :** Quelle commande crée un controller ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `php artisan controller PostController`
- ⬜ `composer make:controller PostController`
- ✅ `php artisan make:controller PostController`
- ⬜ `php artisan new:controller PostController`

**Explication :** Les commandes `make:` d'Artisan génèrent les fichiers. Le controller est créé dans `app/Http/Controllers/`.



### Question 3 — Choix multiple · 1 point

**Énoncé :** Quelles écritures envoient `$posts` à la vue sous le nom `$posts` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `view('posts.index', $posts)`
- ✅ `view('posts.index', ['posts' => $posts])`
- ✅ `view('posts.index', compact('posts'))`
- ✅ `view('posts.index')->with('posts', $posts)`

**Explication :** La dernière passe directement la collection, sans clé : la vue ne reçoit pas de variable `$posts`.



### Question 4 — Choix unique · 1 point

**Énoncé :** Dans `view('posts.index')`, quel fichier est chargé ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `resources/views/posts.index.php`
- ⬜ `app/views/posts/index.php`
- ✅ `resources/views/posts/index.blade.php`
- ⬜ `public/posts/index.html`

**Explication :** Le point remplace la barre oblique, et l'extension `.blade.php` est implicite.



### Question 5 — Choix unique · 1 point

**Énoncé :** Que fait `Post::findOrFail($id)` si l'article n'existe pas ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Renvoie le premier article
- ⬜ Renvoie `null`
- ✅ Déclenche automatiquement une erreur 404
- ⬜ Crée l'article

**Explication :** C'est plus sûr que `find()`, qui renvoie `null` et provoquerait une erreur plus loin dans le code.



### Question 6 — Choix unique · 1 point

**Énoncé :** Avec la route `/posts/{post}`, quelle signature utilise le Route Model Binding ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `show(int $post)`
- ⬜ `show(Request $post)`
- ✅ `show(Post $post)`
- ⬜ `show($id)`

**Explication :** Le type `Post` et le nom `$post` (identique à `{post}`) permettent à Laravel de charger le modèle tout seul.



### Question 7 — Choix unique · 1 point

**Énoncé :** Comment lire le champ `title` envoyé par un formulaire ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `$_POST['title']` est obligatoire
- ⬜ `$post->title`
- ✅ `$request->input('title')`
- ⬜ `Request::title()`

**Explication :** L'objet `Request`, injecté dans la méthode, donne accès à toutes les données envoyées.



### Question 8 — Vrai / Faux · 1 point

**Énoncé :** Si `$request->validate()` échoue, Laravel renvoie automatiquement l'utilisateur au formulaire avec les erreurs.

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai. Pour une requête d'API (JSON), il renvoie à la place une erreur 422 avec la liste des erreurs.



### Question 9 — Choix unique · 1 point

**Énoncé :** Quelle méthode d'un Resource Controller affiche le formulaire de modification ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `show`
- ⬜ `create`
- ✅ `edit`
- ⬜ `update`

**Explication :** `edit` affiche le formulaire (GET). `update` enregistre les modifications (PUT/PATCH).



### Question 10 — Choix multiple · 1 point

**Énoncé :** Pour le FormationController de l'API PassQuiz, quelles affirmations sont vraies ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Il renvoie du JSON avec `response()->json()`
- ✅ On le génère avec l'option `--api`
- ⬜ `index` renvoie toutes les formations, même en brouillon
- ✅ Il n'a pas de méthodes `create` ni `edit`

**Explication :** EF-05 : seules les formations publiées sont visibles des apprenants. On filtre donc avec `where('statut', 'publie')`.
