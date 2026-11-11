# Fiche de saisie — Questions du module 4 : Les vues et Blade
> À copier dans l'administration PassQuiz (quiz du module). PDF correspondant : **Laravel_Module_04_Vues_Blade_Questions.pdf**.

## Quiz — Module 4 : Les vues et Blade

| Paramètre | Valeur |
|---|---|
| Score minimum | 60 % |
| Durée | 15 min |
| Tentatives max | 3 |
| Délai entre deux échecs | 24 h |

### Question 1 — Choix unique · 1 point

**Énoncé :** Quelle est l'extension d'un fichier de vue Blade ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `.blade.php`
- ⬜ `.blade`
- ⬜ `.html`
- ⬜ `.php.blade`

**Explication :** Les vues sont dans `resources/views` et se terminent par `.blade.php`.



### Question 2 — Choix unique · 1 point

**Énoncé :** Quelle est la différence entre `{{ $x }}` et `{!! $x !!}` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Aucune
- ⬜ `{!! !!}` est plus sûr
- ✅ `{{ }}` neutralise le HTML dangereux ; `{!! !!}` affiche le HTML tel quel
- ⬜ `{{ }}` ne fonctionne qu'avec les nombres

**Explication :** `{{ }}` protège contre les failles XSS. On réserve `{!! !!}` au contenu de confiance.



### Question 3 — Choix unique · 1 point

**Énoncé :** Quelle directive affiche un message quand la liste est vide ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `@while`
- ✅ `@forelse … @empty … @endforelse`
- ⬜ `@foreach … @else`
- ⬜ `@if … @endif` uniquement

**Explication :** `@forelse` boucle comme `@foreach`. Le bloc `@empty` s'affiche s'il n'y a aucun élément.



### Question 4 — Choix unique · 1 point

**Énoncé :** Dans une boucle, que vaut `$loop->iteration` au premier tour ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `true`
- ⬜ `null`
- ⬜ 0
- ✅ 1

**Explication :** `iteration` commence à 1. C'est `$loop->index` qui commence à 0.



### Question 5 — Choix unique · 1 point

**Énoncé :** Que se passe-t-il si on oublie `@csrf` dans un formulaire POST ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Laravel refuse la requête (erreur 419)
- ⬜ Rien
- ⬜ Les données sont envoyées en GET
- ⬜ Le formulaire est validé automatiquement

**Explication :** Sans jeton CSRF valide, Laravel considère la requête comme potentiellement forgée par un autre site.



### Question 6 — Choix unique · 1 point

**Énoncé :** Comment envoyer une requête PUT depuis un formulaire HTML ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ `<form method="PUT">`
- ⬜ C'est impossible
- ⬜ `<form method="GET">` + `@put`
- ✅ `<form method="POST">` + `@method('PUT')`

**Explication :** HTML ne connaît que GET et POST. `@method('PUT')` ajoute un champ caché `_method` que Laravel lit.



### Question 7 — Choix multiple · 1 point

**Énoncé :** Quelles directives servent aux layouts ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ `@section`
- ⬜ `@csrf`
- ✅ `@extends`
- ✅ `@yield`

**Explication :** `@csrf` protège les formulaires. Les trois autres organisent l'héritage de pages.



### Question 8 — Choix unique · 1 point

**Énoncé :** Dans un composant Blade, que contient `$slot` ?

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Le contenu placé entre `<x-alert>` et `</x-alert>`
- ⬜ Les paramètres `@props`
- ⬜ La route actuelle
- ⬜ Le nom du composant

**Explication :** C'est l'équivalent de `children` en React : le composant fournit le cadre, le parent fournit le contenu.



### Question 9 — Vrai / Faux · 1 point

**Énoncé :** `@error('title')` affiche le message d'erreur de validation du champ `title` dans la variable `$message`.

**Réponses** (✅ = cocher « réponse correcte ») :

- ✅ Vrai
- ⬜ Faux

**Explication :** Vrai. Il s'utilise après un `validate()` qui a échoué, souvent avec `old('title')` pour remettre la saisie.



### Question 10 — Vrai / Faux · 1 point

**Énoncé :** PassQuiz utilise React pour l'interface, donc Blade ne lui sert à rien.

**Réponses** (✅ = cocher « réponse correcte ») :

- ⬜ Vrai
- ✅ Faux

**Explication :** Faux. Le certificat PDF (EF-19) est une vue Blade que dompdf convertit en PDF.
