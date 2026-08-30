import { Head, Link } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '../../../shared/layouts/AppLayout';
import { Paginated, STATUS_LABELS, TemplateRequestListItem } from '../types/template-request';

interface Props {
    data: {
        requests: Paginated<TemplateRequestListItem>;
    };
}

export default function TemplateRequestsIndex({ data }: Props) {
    const { requests } = data;

    return (
        <AppLayout>
            <Head title="Custom Template Requests" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 mx-auto w-full space-y-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                Custom Template Requests
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                                Ask our team to design a template for you — track progress here.
                            </p>
                        </div>

                        <Link
                            href={route('template-requests.create')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
                            style={{ background: 'var(--color-primary)', color: 'white' }}
                        >
                            <PlusCircle size={15} />
                            New Request
                        </Link>
                    </div>

                    {requests.data.length === 0 ? (
                        <div
                            className="p-6 rounded-xl text-sm text-center"
                            style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border-hover)', color: 'var(--color-muted)' }}
                        >
                            You haven't requested a custom template yet.
                        </div>
                    ) : (
                        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            {requests.data.map((request, index) => {
                                const status = STATUS_LABELS[request.status] ?? STATUS_LABELS.submitted;

                                return (
                                    <Link
                                        key={request.id}
                                        href={route('template-requests.show', { customTemplateRequest: request.id })}
                                        className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors duration-100"
                                        style={{ borderTop: index === 0 ? undefined : '1px solid var(--color-border)' }}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                                {request.title}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                                {request.aspect_ratio} · {request.attachments_count} attachment(s) · {request.created_at}
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
