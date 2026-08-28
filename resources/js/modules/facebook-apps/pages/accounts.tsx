import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RefreshCw, TriangleAlert, Users } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '../../../shared/layouts/AppLayout';
import AccountCard from '../components/AccountCard';
import type { FacebookApp } from '../types/facebook-app';
import type { FacebookAppAccount } from '../types/facebook-app-account';

interface Props {
    data: {
        app: FacebookApp;
        accounts: FacebookAppAccount[];
    };
}

export default function Accounts({ data }: Props) {
    const { app, accounts } = data;
    const [fetching, setFetching] = useState(false);

    const fetchAccounts = () => {
        router.post(
            route('facebook-app-accounts.fetch', { facebookApp: app.id }),
            {},
            { preserveScroll: true, onStart: () => setFetching(true), onFinish: () => setFetching(false) },
        );
    };

    return (
        <AppLayout>
            <Head title={`Accounts · ${app.app_name}`} />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
                    <Link
                        href={route('facebook-apps.index')}
                        className="inline-flex items-center gap-1.5 text-xs w-fit"
                        style={{ color: 'var(--color-muted)' }}
                    >
                        <ArrowLeft size={13} />
                        Back to My Apps
                    </Link>

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                Accounts
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                                Facebook pages connected through <span style={{ color: 'var(--color-text)' }}>{app.app_name}</span>
                            </p>
                        </div>
                        <button
                            onClick={fetchAccounts}
                            disabled={fetching || !app.has_long_lived_token}
                            title={!app.has_long_lived_token ? 'Generate a long-lived token for this app first' : undefined}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                            style={{
                                background: 'var(--color-primary)',
                                color: 'white',
                                fontFamily: 'var(--font-display)',
                                opacity: fetching || !app.has_long_lived_token ? 0.6 : 1,
                            }}
                        >
                            <RefreshCw size={14} className={fetching ? 'animate-spin' : undefined} />
                            {fetching ? 'Fetching…' : 'Fetch Accounts'}
                        </button>
                    </div>

                    {!app.has_long_lived_token && (
                        <div
                            className="flex items-start gap-3 p-3.5 rounded-lg"
                            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
                        >
                            <TriangleAlert size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>
                                This app doesn't have a long-lived token yet. Go back to{' '}
                                <Link href={route('facebook-apps.index')} className="font-medium" style={{ color: 'var(--color-primary)' }}>
                                    My Apps
                                </Link>{' '}
                                and generate one before fetching accounts.
                            </p>
                        </div>
                    )}

                    {/* Accounts grid */}
                    {accounts.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center text-center rounded-xl p-16"
                            style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border-hover)' }}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(24,119,242,0.12)' }}>
                                <Users size={22} style={{ color: '#1877F2' }} />
                            </div>
                            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                No accounts yet
                            </h2>
                            <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                                Click "Fetch Accounts" to pull the Facebook pages this app can manage.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {accounts.map((account) => (
                                <AccountCard key={account.id} account={account} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
