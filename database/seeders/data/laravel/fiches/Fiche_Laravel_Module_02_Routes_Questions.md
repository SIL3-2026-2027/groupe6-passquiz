# Fiche de saisie — Questions du module 2 : Les routes
> À copier dans l'administration PassQuiz (quiz du module). PDF correspondant : **Laravel_Module_02_Routes_Questions.pdf**.

## Quiz — Module 2 : Les routes

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Qu'est-ce qu'une route dans Laravel ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ L'association d'une adresse (URL) à une action à exécuter
- ⬜ Une commande Artisan
- ⬜ Une table de la base de données
- ⬜ Un fichier de vue

**Explication :** Quand une requête arrive, Laravel cherche la route qui correspond au verbe et à l'URL, puis exécute son action.



### Question 2 — Choix multiple · 1 point

**Énoncé :** Quelles associations verbe HTTP / rôle sont correctes ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ GET : lire
- ✅ POST : envoyer / créer
- ✅ PUT : modifier
- ⬜ DELETE : modifier

**Explication :** DELETE sert à supprimer. PUT (ou PATCH) sert à modifier.



### Question 3 — Choix unique · 1 point

**Énoncé :** Que renvoie `/posts/abc` avec cette route ?

```php
Route::get('/posts/{id}', fn ($id) => "Post $id")
    ->where('id', '[0-9]+');
```

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ « Post 0 »
- ✅ Une erreur 404
- ⬜ « Post abc »
- ⬜ « Post »

**Explication :** La contrainte exige des chiffres. « abc » ne correspond pas, donc aucune route n'est trouvée.



### Question 4 — Choix unique · 1 point

**Énoncé :** Comment rendre un paramètre de route optionnel ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `{?nom}`
- ⬜ `{nom*}`
- ✅ `{nom?}` avec une valeur par défaut dans la fonction
- ⬜ `optional('nom')`

**Explication :** Le `?` rend le segment facultatif. La variable PHP doit alors avoir une valeur par défaut, par exemple `$nom = 'invité'`.



### Question 5 — Choix unique · 1 point

**Énoncé :** Quel est l'intérêt principal d'une route nommée ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Protéger la route
- ⬜ Accélérer la route
- ⬜ Créer automatiquement le controller
- ✅ Générer les URL avec `route('nom')` : les liens suivent si l'adresse change

**Explication :** On change l'adresse à un seul endroit (`web.php`). Tous les liens générés avec `route()` se mettent à jour.



### Question 6 — Choix unique · 1 point

**Énoncé :** Quelle syntaxe relie une route à la méthode `index` de PostController ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `Route::get('/posts', [PostController::class, 'index'])`
- ⬜ `Route::get('/posts', 'PostController')`
- ⬜ `Route::get('/posts', PostController->index())`
- ⬜ `Route::controller('/posts', 'index')`

**Explication :** Un tableau `[Classe::class, 'méthode']`, avec le `use App\Http\Controllers\PostController;` en haut du fichier.



### Question 7 — Choix multiple · 1 point

**Énoncé :** Dans un groupe de routes, que peut-on mettre en commun ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Un début de nom (`name`)
- ✅ Un middleware (`middleware`)
- ✅ Un préfixe d'URL (`prefix`)
- ⬜ La base de données utilisée

**Explication :** La base de données se configure dans `.env` et `config/database.php`, pas dans les routes.



### Question 8 — Choix unique · 1 point

**Énoncé :** Combien de routes crée `Route::resource('posts', PostController::class)` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ 4
- ⬜ 10
- ⬜ 5
- ✅ 7

**Explication :** index, create, store, show, edit, update et destroy.



### Question 9 — Choix unique · 1 point

**Énoncé :** Quelle route du resource gère `POST /posts` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `store`
- ⬜ `update`
- ⬜ `create`
- ⬜ `index`

**Explication :** `create` affiche le formulaire (GET). `store` enregistre les données envoyées (POST).



### Question 10 — Vrai / Faux · 1 point

**Énoncé :** Pour l'API de PassQuiz, `Route::apiResource` convient mieux que `Route::resource`, car les routes `create` et `edit` sont inutiles.

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai. Ces deux routes affichent des formulaires HTML, alors que les formulaires de PassQuiz sont affichés par React.
