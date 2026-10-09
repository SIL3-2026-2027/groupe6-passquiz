<?php

use Illuminate\Support\Facades\Route;

/*
| L'application React gère toutes les pages (hors /api, /storage et /up).
*/
Route::view('/{any?}', 'app')->where('any', '^(?!api|storage|up).*$')->name('app');
