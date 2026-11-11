# Fiche de saisie — Questions du module 10 : L'authentification
> À copier dans l'administration PassQuiz (quiz du module). PDF correspondant : **Laravel_Module_10_Authentification_Questions.pdf**.

## Quiz — Module 10 : L'authentification

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Quelle est la différence entre authentification et autorisation ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ L'authentification identifie l'utilisateur ; l'autorisation vérifie ce qu'il a le droit de faire
- ⬜ L'authentification ne concerne que les API
- ⬜ Aucune
- ⬜ L'autorisation se fait avant l'authentification

**Explication :** On sait d'abord qui est l'utilisateur, puis on vérifie ses droits.



### Question 2 — Choix unique · 1 point

**Énoncé :** Que fait `Hash::make($mdp)` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Chiffre le mot de passe de façon réversible
- ⬜ Envoie le mot de passe par e-mail
- ✅ Produit un hash irréversible (bcrypt) à stocker en base
- ⬜ Vérifie le mot de passe

**Explication :** On ne peut pas retrouver le mot de passe à partir du hash. On vérifie une saisie avec `Hash::check`.



### Question 3 — Vrai / Faux · 1 point

**Énoncé :** On peut stocker les mots de passe en clair si la base de données est protégée.

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Vrai
- ✅ Faux

**Explication :** Faux. ENF-01 impose le hachage (bcrypt). En cas de fuite, les mots de passe ne doivent pas être lisibles.



### Question 4 — Choix unique · 1 point

**Énoncé :** Que fait `Auth::attempt(['email' => $e, 'password' => $p])` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Envoie un lien de réinitialisation
- ⬜ Crée un compte
- ⬜ Supprime la session
- ✅ Vérifie les identifiants et, s'ils sont corrects, connecte l'utilisateur

**Explication :** Il renvoie `true` ou `false`. Le mot de passe saisi est comparé au hash.



### Question 5 — Choix unique · 1 point

**Énoncé :** Un visiteur non connecté ouvre une route avec `->middleware('auth')`. Que se passe-t-il (site web) ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Il est connecté automatiquement
- ✅ Il est redirigé vers la page de connexion
- ⬜ La page s'affiche
- ⬜ Erreur 500

**Explication :** Pour une requête d'API, Laravel répond 401 à la place.



### Question 6 — Choix multiple · 1 point

**Énoncé :** Comment récupérer l'utilisateur connecté dans un controller ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `User::current()`
- ✅ `auth()->user()`
- ✅ `$request->user()`
- ✅ `Auth::user()`

**Explication :** `User::current()` n'existe pas.



### Question 7 — Choix unique · 1 point

**Énoncé :** Quelles directives Blade affichent un bloc selon que l'utilisateur est connecté ou non ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `@auth` / `@guest`
- ⬜ `@login` / `@logout`
- ⬜ `@if(auth)`
- ⬜ `@user` / `@visitor`

**Explication :** `@auth … @endauth` et `@guest … @endguest`.



### Question 8 — Choix unique · 1 point

**Énoncé :** Pour une API consommée par React, comment le client prouve-t-il qui il est ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Avec son adresse IP
- ⬜ Avec `@csrf`
- ⬜ Avec un cookie de thème
- ✅ Avec l'en-tête `Authorization: Bearer <jeton>` délivré par Sanctum

**Explication :** Les routes sont protégées par `auth:sanctum`, qui vérifie ce jeton.



### Question 9 — Choix unique · 1 point

**Énoncé :** Dans PassQuiz, comment révoquer le jeton à la déconnexion (EF-02) ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `Auth::logout()`
- ⬜ Supprimer l'utilisateur
- ✅ `$request->user()->currentAccessToken()->delete()`
- ⬜ Vider le localStorage côté React suffit

**Explication :** Le jeton est supprimé en base : même copié, il ne fonctionne plus. Vider le localStorage seul laisserait le jeton valide.



### Question 10 — Vrai / Faux · 1 point

**Énoncé :** À la connexion, il vaut mieux répondre « Identifiants invalides » plutôt que « Cet e-mail n'existe pas ».

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai. Un message différent permettrait de deviner quels e-mails ont un compte.

