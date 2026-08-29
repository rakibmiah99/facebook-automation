import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '../../../../shared/layouts/AppLayout';
import { STATUS_LABELS } from '../../../template-requests/types/template-request';
import type { AdminRequestListItem, Paginated } from '../types/admin-template-request';

interface Props {
    data: {
        requests: Paginated<AdminRequestListItem>;
    };
}

export default function AdminTemplateRequestsIndex({ data }: Props) {
    const { requests } = data;

    return (
        <AppLayout>
            <Head title="Template Requests" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                            Template Requests
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                            Review customer requests, then build and assign a template.
                        </p>
                    </div>

                    {requests.data.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No requests yet.</p>
                    ) : (
                        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            {requests.data.map((request, index) => {
                                const status = STATUS_LABELS[request.status] ?? STATUS_LABELS.submitted;

                                return (
                                    <Link
                                        key={request.id}
                                        href={route('admin.template-requests.show', { customTemplateRequest: request.id })}
                                        className="flex items-center justify-between gap-4 px-4 py-3.5"
                                        style={{ borderTop: index === 0 ? undefined : '1px solid var(--color-border)' }}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                                {request.title}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                                {request.user?.name} · {request.aspect_ratio} · {request.attachments_count} attachment(s) · {request.created_at}
                                            </p>
                                        </div>
                                        <span
                                            className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                                            style={{ background: status.bg, color: status.color }}
                                        >
                                            {status.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
