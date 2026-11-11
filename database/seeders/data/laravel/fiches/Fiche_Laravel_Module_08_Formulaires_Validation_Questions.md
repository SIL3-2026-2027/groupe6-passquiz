# Fiche de saisie — Questions du module 8 : Formulaires et validation
> Retranscrit depuis **Laravel_Module_08_Formulaires_Validation_Questions.pdf** (questions et corrigé).

## Quiz — Module 8 : Formulaires et validation

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Quelle méthode HTTP utiliser pour un formulaire de recherche ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ DELETE
- ✅ GET
- ⬜ POST
- ⬜ PUT

**Explication :** Une recherche ne modifie rien. GET met les critères dans l'URL, qu'on peut ensuite partager.



### Question 2 — Choix unique · 1 point

**Énoncé :** Que se passe-t-il si un formulaire POST n'a pas `@csrf` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Erreur 404
- ⬜ Rien
- ✅ Erreur 419 (Page Expired)
- ⬜ Les données sont enregistrées sans validation

**Explication :** Sans jeton CSRF valide, Laravel refuse la requête.



### Question 3 — Choix unique · 1 point

**Énoncé :** Contre quoi protège le jeton CSRF ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Un site piégé qui envoie un formulaire à votre site en utilisant votre session
- ⬜ Les injections SQL
- ⬜ Les mots de passe faibles
- ⬜ Les fichiers trop gros

**Explication :** C'est le principe de la Cross-Site Request Forgery.



### Question 4 — Choix unique · 1 point

**Énoncé :** Que renvoie `$request->validate([...])` si tout est valide ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `true`
- ✅ Le tableau des données validées
- ⬜ La requête complète
- ⬜ Rien

**Explication :** On peut donc écrire directement `Post::create($data)` avec seulement les champs vérifiés.



### Question 5 — Choix unique · 1 point

**Énoncé :** Que fait Laravel si la validation échoue (formulaire web) ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Renvoie au formulaire avec les erreurs et la saisie précédente
- ⬜ Affiche une page blanche
- ⬜ Supprime la session
- ⬜ Enregistre quand même

**Explication :** Les erreurs sont lisibles avec `@error` et `$errors`, et la saisie avec `old()`.



### Question 6 — Choix multiple · 1 point

**Énoncé :** Quelles règles correspondent à « e-mail obligatoire, valide et pas déjà utilisé » ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `email`
- ✅ `required`
- ✅ `unique:users,email`
- ⬜ `confirmed`

**Explication :** `confirmed` sert à vérifier qu'un champ est identique à sa confirmation (mot de passe).



### Question 7 — Choix unique · 1 point

**Énoncé :** Que fait la règle `confirmed` sur `password` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Vérifie la force du mot de passe
- ⬜ Envoie un e-mail de confirmation
- ✅ Vérifie que `password` est identique à `password_confirmation`
- ⬜ Hache le mot de passe

**Explication :** Le formulaire doit contenir un champ nommé `password_confirmation`.



### Question 8 — Choix unique · 1 point

**Énoncé :** À quoi sert `old('title')` dans une vue ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ À afficher l'ancienne valeur en base
- ⬜ À supprimer le champ
- ⬜ À afficher l'erreur
- ✅ À remettre la valeur saisie après un échec de validation

**Explication :** L'utilisateur n'a pas à tout ressaisir.



### Question 9 — Vrai / Faux · 1 point

**Énoncé :** Dans `@error('title') … @enderror`, le message est disponible dans la variable `$message`.

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai.



### Question 10 — Choix unique · 1 point

**Énoncé :** Dans l'inscription PassQuiz, pourquoi forcer `'role' => 'apprenant'` au lieu de le lire dans la requête ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Parce que le champ n'existe pas
- ⬜ Pour la performance
- ✅ Sinon un visiteur pourrait envoyer `role=admin` et devenir administrateur
- ⬜ Pour respecter le CSRF

**Explication :** EF-01 : tout compte est créé avec le rôle apprenant. Seul l'admin change les rôles (section 4.1).
