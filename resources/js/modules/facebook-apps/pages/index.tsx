import { Head, useForm } from '@inertiajs/react';
import { Facebook, Plus } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import AppLayout from '../../../shared/layouts/AppLayout';
import AppCard from '../components/AppCard';
import AppFormModal from '../components/AppFormModal';
import type { FacebookApp } from '../types/facebook-app';
import { route } from 'ziggy-js';

interface Props {
    data: {
        apps: FacebookApp[];
    };
}

export default function Index({ data }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<FacebookApp | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FacebookApp | null>(null);
    const deleteForm = useForm({});

    const openCreate = () => {
        setEditingApp(null);
        setFormOpen(true);
    };

    const openEdit = (app: FacebookApp) => {
        setEditingApp(app);
        setFormOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        deleteForm.post(route('facebook-apps.destroy', { facebookApp: deleteTarget.id }), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AppLayout>
            <Head title="My Apps" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 mx-auto w-full space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                My Apps
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                                Manage the Facebook apps connected to your account.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={openCreate}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-hover)')}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
                            >
                                <Plus size={14} />
                                Add App
                            </button>
                            <a
                                href={route('facebook.connect')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                style={{ background: '#1877F2', color: 'white', fontFamily: 'var(--font-display)' }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.88')}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                            >
                                <Facebook size={14} />
                                Connect with Facebook
                            </a>
                        </div>
                    </div>

                    {/* Apps grid */}
                    {data.apps.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center text-center rounded-xl p-16"
                            style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border-hover)' }}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(24,119,242,0.12)' }}>
                                <Facebook size={22} style={{ color: '#1877F2' }} />
                            </div>
                            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                No apps yet
                            </h2>
                            <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                                Connect with Facebook to pull in your Pages automatically, or add an app manually.
                            </p>
                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    onClick={openCreate}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                >
                                    <Plus size={14} />
                                    Add App
                                </button>
                                <a
                                    href={route('facebook.connect')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                    style={{ background: '#1877F2', color: 'white', fontFamily: 'var(--font-display)' }}
                                >
                                    <Facebook size={14} />
                                    Connect with Facebook
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {data.apps.map((app) => (
                                <AppCard key={app.id} app={app} onEdit={() => openEdit(app)} onDelete={() => setDeleteTarget(app)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AppFormModal key={editingApp?.id ?? 'create'} open={formOpen} onClose={() => setFormOpen(false)} app={editingApp} />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete this app?"
                description={deleteTarget ? `"${deleteTarget.app_name}" will be permanently removed. This can't be undone.` : undefined}
                confirmLabel="Delete"
                processing={deleteForm.processing}
            />
        </AppLayout>
    );
}
