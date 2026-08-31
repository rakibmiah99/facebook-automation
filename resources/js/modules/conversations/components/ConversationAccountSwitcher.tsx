import type { ConversationApp, ConversationPage } from '../types/conversation';

interface Props {
    apps: ConversationApp[];
    selectedApp: ConversationApp | null;
    pages: ConversationPage[];
    selectedAccount: ConversationPage | null;
    onSelectApp: (appId: number) => void;
    onSelectAccount: (accountId: number) => void;
}

export default function ConversationAccountSwitcher({ apps, selectedApp, pages, selectedAccount, onSelectApp, onSelectAccount }: Props) {
    return (
        <div
            className="flex items-center gap-5 px-6 py-3 flex-wrap flex-shrink-0"
            style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
        >
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                    Facebook Account
                </span>
                <select
                    value={selectedApp?.id ?? ''}
                    onChange={(e) => e.target.value && onSelectApp(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                    <option value="" disabled>
                        Select account…
                    </option>
                    {apps.map((app) => (
                        <option key={app.id} value={app.id}>
                            {app.app_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto min-w-0">
                {pages.length === 0 ? (
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        {selectedApp ? 'No Pages fetched for this account yet.' : 'Connect a Facebook account first.'}
                    </span>
                ) : (
                    pages.map((page) => {
                        const active = selectedAccount?.id === page.id;

                        return (
                            <button
                                key={page.id}
                                type="button"
                                onClick={() => onSelectAccount(page.id)}
                                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-100"
                                style={{
                                    background: active ? 'var(--color-primary)' : 'var(--color-surface-2)',
                                    color: active ? 'white' : 'var(--color-text)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                {page.account_name}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
