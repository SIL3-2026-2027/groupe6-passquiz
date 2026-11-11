# Fiche de saisie — Questions du module 5 : Bases de données et migrations
> Retranscrit depuis **Laravel_Module_05_Migrations_Questions.pdf** (questions et corrigé).

## Quiz — Module 5 : Bases de données et migrations

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Où configure-t-on la connexion à la base MySQL ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `routes/web.php`
- ✅ Le fichier `.env`
- ⬜ `public/index.php`
- ⬜ `resources/views`

**Explication :** Les variables `DB_*` du fichier `.env` sont propres à chaque machine.



### Question 2 — Choix unique · 1 point

**Énoncé :** Qu'est-ce qu'une migration ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Une copie de sauvegarde de la base
- ⬜ Une requête SQL écrite dans une vue
- ✅ Un fichier PHP qui décrit la création ou la modification d'une table
- ⬜ Un transfert de serveur

**Explication :** C'est la structure de la base sous forme de code, versionnée avec Git.



### Question 3 — Choix unique · 1 point

**Énoncé :** Que crée `$t->id()` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Une colonne texte
- ⬜ Un index unique sur le nom
- ⬜ Une clé étrangère
- ✅ La clé primaire auto-incrémentée

**Explication :** Une colonne `id` (BIGINT non signé, auto-incrémenté), clé primaire de la table.



### Question 4 — Choix unique · 1 point

**Énoncé :** Que fait `$t->foreignId('user_id')->constrained()` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Rend la colonne unique
- ✅ Crée une colonne `user_id` liée à `users.id` (clé étrangère)
- ⬜ Crée un utilisateur
- ⬜ Supprime la table `users`

**Explication :** `constrained()` déduit la table `users` à partir du nom `user_id` et ajoute la contrainte.



### Question 5 — Choix multiple · 1 point

**Énoncé :** Quelles colonnes ajoute `$t->timestamps()` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `published_at`
- ✅ `created_at`
- ✅ `updated_at`
- ⬜ `deleted_at`

**Explication :** `deleted_at` vient de `softDeletes()`. Eloquent remplit automatiquement `created_at` et `updated_at`.



### Question 6 — Choix unique · 1 point

**Énoncé :** Quelle commande annule le dernier lot de migrations ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `php artisan migrate:undo`
- ⬜ `php artisan db:back`
- ✅ `php artisan migrate:rollback`
- ⬜ `php artisan migrate:delete`

**Explication :** `rollback` exécute la méthode `down()` des migrations du dernier lot.



### Question 7 — Vrai / Faux · 1 point

**Énoncé :** Pour ajouter une colonne à une table déjà migrée et partagée, on modifie l'ancienne migration.

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Vrai
- ✅ Faux

**Explication :** Faux. On crée une nouvelle migration (`add_slug_to_posts_table`) : les autres développeurs l'appliqueront avec `migrate`.



### Question 8 — Choix unique · 1 point

**Énoncé :** Que fait `php artisan migrate:fresh --seed` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Met à jour sans rien perdre
- ⬜ Ne lance que les seeders
- ⬜ Sauvegarde la base
- ✅ Supprime toutes les tables, les recrée, puis lance les seeders

**Explication :** Toutes les données sont perdues : à réserver au développement.



### Question 9 — Choix multiple · 1 point

**Énoncé :** Quels rôles sont corrects ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ La Factory décrit comment fabriquer de fausses données
- ⬜ La Factory modifie la structure des tables
- ✅ Le Seeder remplit la base
- ✅ `fake()->sentence()` génère une phrase aléatoire

**Explication :** C'est la migration qui modifie la structure, pas la Factory.



### Question 10 — Choix unique · 1 point

**Énoncé :** Dans PassQuiz, pourquoi `module_id` est-il `nullable()` dans la table `quiz` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Par erreur
- ⬜ Pour accélérer les requêtes
- ✅ Parce qu'un quiz sans module est l'évaluation finale de la formation
- ⬜ Parce que les modules sont facultatifs

**Explication :** Section 9 du cahier : « Un quiz avec `module_id` nul est l'évaluation finale de la formation ».
