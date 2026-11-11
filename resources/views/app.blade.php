<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PassQuiz</title>
    <script>
        // Applique le thème avant l'affichage pour éviter un flash clair (voir resources/js/lib/theme.js).
        (function () {
            var theme = null;
            try { theme = localStorage.getItem('passquiz-theme'); } catch (e) {}
            if (theme !== 'light' && theme !== 'dark') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            document.documentElement.classList.toggle('dark', theme === 'dark');
        })();
    </script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body class="bg-slate-50 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-200">
    <div id="app"></div>
</body>
</html>
