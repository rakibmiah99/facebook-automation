import { ExternalLink, Users } from 'lucide-react';
import type { FacebookAppAccount } from '../types/facebook-app-account';

interface AccountCardProps {
    account: FacebookAppAccount;
}

export default function AccountCard({ account }: AccountCardProps) {
    return (
        <div
            className="rounded-xl p-5 transition-all duration-150"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-hover)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(24,119,242,0.12)' }}>
                        <Users size={18} style={{ color: '#1877F2' }} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                            {account.account_name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                            Page ID: {account.account_id}
                        </p>
                    </div>
                </div>

                {account.link && (
                    <a
                        href={account.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open on Facebook"
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100 flex-shrink-0"
                        style={{ color: 'var(--color-muted)' }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                            (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)';
                        }}
                    >
                        <ExternalLink size={14} />
                    </a>
                )}
            </div>

            <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Followers
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                    {account.fan_count !== null ? account.fan_count.toLocaleString() : '—'}
                </span>
            </div>
        </div>
    );
}
