import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ToastProvider } from './shared/components/Toast';
import { Ziggy } from './ziggy.js';
globalThis.Ziggy = Ziggy;

// @ts-ignore
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    resolve: (name) =>
        resolvePageComponent(
            `./modules/${name}.tsx`,
            // @ts-ignore
            import.meta.glob('./modules/**/*.tsx'),
        ) as Promise<ResolvedComponent>,

    withApp(app) {
        return <ToastProvider>{app}</ToastProvider>;
    },

    progress: {
        color: '#7c3aed',
    },
});
