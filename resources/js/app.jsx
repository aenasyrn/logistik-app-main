import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'SmartLog';

// Cegah modal default 419 Page Expired dan langsung arahkan ke form login
router.on('invalid', (event) => {
    if (event.detail.response && event.detail.response.status === 419) {
        event.preventDefault();
        window.location.replace('/login?timeout=1');
    }
});

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);

        // Bersihkan atribut data-page dari DOM agar data mentah tidak terlihat di Inspect Element
        el.removeAttribute('data-page');
    },
    progress: {
        color: '#4B5563',
    },
});
