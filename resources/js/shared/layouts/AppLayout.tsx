import { router, usePage } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';
import { route } from 'ziggy-js';
import type { SharedPageProps } from '../types/shared';
import CommandPalette from '../components/CommandPalette';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { applyTheme, getStoredTheme } from '../utils/theme';

interface AppLayoutProps {
    children?: ReactNode;
}

// Module-scoped (not component state): Inertia's 'success' event only fires for
// client-side visits, never for the very first hard page load (e.g. a browser
// landing here via a plain redirect, such as returning from Facebook's OAuth
// dialog). We show that first load's flash once via this flag, then defer to
// the event listener below for everything after — resets naturally on refresh.
let hasHandledInitialFlash = false;

export default function AppLayout({ children }: AppLayoutProps) {
    const { auth, flash } = usePage<SharedPageProps>().props;
    const { toast } = useToast();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [cmdOpen, setCmdOpen] = useState(false);
    const [isDark, setIsDark] = useState(() => getStoredTheme() === 'dark');

    useEffect(() => {
        if (hasHandledInitialFlash) return;
        hasHandledInitialFlash = true;

        const message = flash?.success ?? flash?.error;
        if (message) {
            toast(message, flash?.error ? 'error' : 'success');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fire a toast for every completed visit's flash message, read straight off the event
    // rather than the `flash` prop — two visits in a row that carry the *same* message text
    // (e.g. retrying and hitting the identical Facebook error again) would otherwise never
    // re-trigger a prop-watching effect, since React skips effects whose dependencies compare
    // equal to their previous value.
    useEffect(() => {
        return router.on('success', (event) => {
            const flash = (event.detail.page.props as unknown as SharedPageProps).flash;
            const message = flash?.success ?? flash?.error;

            if (message) {
                toast(message, flash?.error ? 'error' : 'success');
            }
        });
    }, [toast]);

    // Close the mobile drawer after any navigation, so it doesn't stay open over the new page.
    useEffect(() => {
        return router.on('navigate', () => setMobileSidebarOpen(false));
    }, []);

    useEffect(() => {
        const handle = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen((o) => !o);
            }
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, []);

    const toggleTheme = () => {
        const next = isDark ? 'light' : 'dark';
        applyTheme(next);
        setIsDark(next === 'dark');
        toast(isDark ? 'Switched to light mode' : 'Switched to dark mode', 'info');
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    if (!auth.user) return null;

    return (
        <div className="flex h-full overflow-hidden">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((c) => !c)}
                mobileOpen={mobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
            />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar
                    user={auth.user}
                    onLogout={handleLogout}
                    onOpenSearch={() => setCmdOpen(true)}
                    onOpenSidebar={() => setMobileSidebarOpen(true)}
                    isDark={isDark}
                    onToggleTheme={toggleTheme}
                />
                <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
            </div>

            <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onLogout={handleLogout} onToggleTheme={toggleTheme} isDark={isDark} />
        </div>
    );
}
