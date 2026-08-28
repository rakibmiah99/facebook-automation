<html>
<head>
    <title inertia>{{ config('app.name', 'Laravel') }}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
        (function () {
            var stored = localStorage.getItem('app-theme');
            var isDark = stored ? stored === 'dark' : true;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        })();
    </script>
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
