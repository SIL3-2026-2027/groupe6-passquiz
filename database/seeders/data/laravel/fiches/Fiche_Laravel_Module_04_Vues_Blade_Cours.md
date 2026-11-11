# Fiche de saisie — Les vues et Blade
> À copier dans l'administration PassQuiz (formation **Laravel**). PDF du cours à joindre : **Laravel_Module_04_Vues_Blade_Cours.pdf** · Questions et corrigé : **Laravel_Module_04_Vues_Blade_Questions.pdf**.

## Module

| Champ | Valeur |
|---|---|
| Ordre | 4 |
| Titre | Les vues et Blade |
| Description | Afficher des pages dynamiques, sûres et bien organisées. |

## Cours 1 — Blade : vues et affichage

| Champ | Valeur |
|---|---|
| Titre | Blade : vues et affichage |
| Description | Le moteur de templates de Laravel. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 1 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_04_Vues_Blade_Cours.pdf (à joindre au cours 1 ; ou à chaque cours) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Créer et appeler une vue

**resources/views/posts/index.blade.php**

```blade
<h1>Mes articles</h1>
<p>{{ strtoupper($nom) }}</p>
```

- Fichiers `.blade.php` dans `resources/views`
- Du HTML + des instructions Blade

**routes/web.php**

```php
Route::get('/posts', function () {
    return view('posts.index',
        ['nom' => 'Awa']);
});
```

- `view()` reçoit le nom **sans extension**
- Un **point** remplace la barre oblique

### Afficher des données : {{ }} ou {!! !!}

- `{{ }}` affiche une variable en **neutralisant le HTML** dangereux
- `{!! !!}` affiche le HTML **tel quel**
- On peut appeler des fonctions PHP : `{{ strtoupper($nom) }}`
- `{{-- --}}` : commentaire invisible dans la page

```blade
{{-- Échappé : sûr --}}
<p>{{ $post->title }}</p>
<p>{{ $post->created_at->format('d/m/Y') }}</p>

{{-- Brut : à éviter, sauf contenu de confiance --}}
{!! $post->content !!}

{{-- Valeur par défaut --}}
<p>{{ $user->bio ?? 'Pas de bio' }}</p>
```

> **Pourquoi c'est important : XSS** — Si un utilisateur écrit `<script>…</script>` dans un commentaire, `{{ }}` l'affiche comme du texte. `{!! !!}` l'exécuterait chez tous les visiteurs.

---

## Cours 2 — Conditions et boucles

| Champ | Valeur |
|---|---|
| Titre | Conditions et boucles |
| Description | Afficher selon les données. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 2 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_04_Vues_Blade_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Conditions et boucles

**Condition**

```blade
@if ($note >= 10)
    <p>Admis</p>
@elseif ($note >= 8)
    <p>Rattrapage</p>
@else
    <p>Refusé</p>
@endif
```

- Le bloc s'affiche seulement si la condition est vraie
- Aussi : `@unless`, `@isset`, `@empty`

**Boucle avec liste vide**

```blade
@forelse ($posts as $post)
    <li>{{ $post->title }}</li>
@empty
    <li>Aucun article.</li>
@endforelse
```

- `@foreach` répète le bloc pour chaque élément
- `@forelse` prévoit un message **quand la liste est vide**

### La variable $loop

- Disponible dans toute boucle `@foreach`
- `$loop->iteration` : numéro (à partir de 1)
- `$loop->index` : position (à partir de 0)
- `$loop->first`, `$loop->last`, `$loop->count`

```blade
<ol>
@foreach ($questions as $question)
    <li class="{{ $loop->first ? 'premiere' : '' }}">
        Question {{ $loop->iteration }} / {{ $loop->count }}
        : {{ $question->enonce }}
    </li>
@endforeach
</ol>
```

---

## Cours 3 — Les directives utiles

| Champ | Valeur |
|---|---|
| Titre | Les directives utiles |
| Description | Utilisateur connecté, formulaires et erreurs. |
| Durée estimée (minutes) | 15 |
| Ordre du cours dans le module | 3 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_04_Vues_Blade_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### @auth, @csrf, @method et @error

- **@auth / @guest** : bloc selon que l'utilisateur est connecté ou non
- **@csrf** : jeton qui **protège** le formulaire ; sans lui, erreur **419**
- **@method('PUT')** : simule PUT ou DELETE (HTML ne connaît que GET et POST)
- **@error** : message d'erreur du champ après la validation
- `old('title')` : remet la saisie après une erreur

```blade
{{-- Selon l'utilisateur --}}
@auth
    <p>Bonjour {{ Auth::user()->name }}</p>
@else
    <a href="/login">Connexion</a>
@endauth

{{-- Dans un formulaire --}}
<form method="POST" action="/posts/1">
    @csrf
    @method('PUT')
    <input name="title" value="{{ old('title') }}">
    @error('title')
        <p class="erreur">{{ $message }}</p>
    @enderror
</form>
```

> **CSRF en une phrase** — Le jeton prouve que le formulaire vient bien de votre site, et pas d'un site piégé qui enverrait la requête à votre place.

---

## Cours 4 — Layouts et composants

| Champ | Valeur |
|---|---|
| Titre | Layouts et composants |
| Description | Écrire le menu et le pied de page une seule fois. |
| Durée estimée (minutes) | 25 |
| Ordre du cours dans le module | 4 |
| Vidéo | (facultatif) |
| Document PDF | Laravel_Module_04_Vues_Blade_Cours.pdf (facultatif : même PDF) |

**Contenu du cours** — copier tout ce qui se trouve entre les deux lignes :

---

### Layouts : extends, section, yield, include

**layouts/app.blade.php**

```blade
<html>
<body>
  <nav>Menu</nav>
  @yield('content')
  @include('partials.footer')
</body>
</html>
```

- **@yield** : emplacement d'une zone
- **@include** : insère un fragment réutilisable

**Une page**

```blade
@extends('layouts.app')

@section('content')
  <h1>Mes articles</h1>
@endsection
```

- **@extends** : quel layout la page utilise
- **@section** : le contenu de la zone

### Les composants Blade

**components/alert.blade.php**

```blade
@props(['type' => 'info'])

<div class="alert alert-{{ $type }}">
    {{ $slot }}
</div>
```

- Créé avec `php artisan make:component alert --view`
- **@props** : paramètres + valeurs par défaut
- **$slot** : le contenu placé entre les balises

**Utilisation**

```blade
<x-alert type="danger">
    Une erreur est survenue.
</x-alert>

<x-alert>
    Information (type = info)
</x-alert>
```

- Balise qui commence par **x-**
- Même idée que les props et `children` de React

### Exemple complet : de la route à la vue

- **1. Route** : l'adresse est reliée à une méthode du controller
- **2. Controller** : lit les articles avec le Model et les envoie à la vue
- **3. Vue** : hérite du layout, boucle et affiche chaque titre
- **Résultat** : la liste, avec le menu et le pied de page du layout

```text
// routes/web.php
Route::get('/posts', [PostController::class, 'index']);

// PostController.php (index)
$posts = Post::all();
return view('posts.index', compact('posts'));

// posts/index.blade.php
@extends('layouts.app')
@section('content')
  @foreach ($posts as $post)
    <h2>{{ $post->title }}</h2>
  @endforeach
@endsection
```

### Application PassQuiz — le certificat en Blade

EF-19 : le certificat PDF est une vue Blade convertie par barryvdh/laravel-dompdf.

- Même si le site est en React, **le PDF est généré par Blade**
- `{{ }}` : le nom de l'apprenant est échappé
- Section 7 du cahier : nom, formation, score, date, numéro
- Le lien de vérification utilise une **route nommée** (EF-20)

```blade
{{-- resources/views/pdf/certificat.blade.php --}}
<div class="certificat">
  <h1>PASSQUIZ</h1>
  <h2>CERTIFICAT DE RÉUSSITE</h2>
  <p>Nous certifions que</p>
  <p class="nom">{{ $certificat->user->nom }}</p>
  <p>a réussi la formation {{ $certificat->formation->titre }}
     avec un score de {{ $certificat->score }} %</p>
  <p>Date : {{ $certificat->emis_le->format('d/m/Y') }}</p>
  <p>Certificat N° : {{ $certificat->numero }}</p>
  <p>Vérification :
     {{ route('verification', $certificat->numero) }}</p>
</div>

<?php
// CertificatController@pdf
return Pdf::loadView('pdf.certificat', compact('certificat'))
    ->download("{$certificat->numero}.pdf");
```

### À retenir

- Blade = HTML + directives, fichiers `.blade.php`
- `{{ }}` échappe, `{!! !!}` n'échappe pas
- `@if`, `@foreach`, `@forelse`, `$loop`
- `@auth`, `@csrf`, `@method`, `@error`
- Layouts (`@extends` / `@yield`) et composants (`<x-…>`)

### Pièges à éviter

- `{!! !!}` sur une saisie utilisateur (faille XSS)
- Oublier `@csrf` : erreur 419 à l'envoi
- `<form method="PUT">` au lieu de POST + `@method('PUT')`
- `@extends` qui n'est pas la première ligne de la vue
- Nom de vue avec `/` ou `.blade.php` dans `view()`

*Module suivant → bases de données et migrations*

---
