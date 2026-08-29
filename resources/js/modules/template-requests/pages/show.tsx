import { Head, Link, router } from '@inertiajs/react';
import { File as FileIcon, XCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '../../../shared/layouts/AppLayout';
import { STATUS_LABELS, TemplateRequestDetail } from '../types/template-request';

interface Props {
    data: {
        request: TemplateRequestDetail;
    };
}

const CANCELLABLE = ['submitted', 'under_review', 'awaiting_info'];

export default function TemplateRequestShow({ data }: Props) {
    const { request } = data;
    const status = STATUS_LABELS[request.status] ?? STATUS_LABELS.submitted;

    const cancel = () => {
        router.post(route('template-requests.cancel', { customTemplateRequest: request.id }), {}, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title={request.title} />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
                    <div>
                        <Link href={route('template-requests.index')} className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            ← Back to Requests
                        </Link>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                {request.title}
                            </h1>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
                                {status.label}
                            </span>
                        </div>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                            {request.aspect_ratio}
                            {request.width && request.height ? ` · ${request.width}×${request.height}` : ''} · Submitted {request.created_at}
                        </p>
                    </div>

                    {request.templates.length > 0 && (
                        <div className="rounded-2xl p-4" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                            <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                                Your template is ready
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {request.templates.map((template) => (
                                    <Link
                                        key={template.id}
                                        href={route('templates.edit', { template: template.id })}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                                        style={{ background: 'var(--color-primary)', color: 'white' }}
                                    >
                                        Customize “{template.name}”
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl p-5 space-y-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                            Requirements
                        </h2>
                        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-muted)' }}>
                            {request.description}
                        </p>
                    </div>

                    {request.admin_notes && (
                        <div className="rounded-2xl p-5 space-y-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                Notes from our team
                            </h2>
                            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-muted)' }}>
                                {request.admin_notes}
                            </p>
                        </div>
                    )}

                    <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                            Reference files
                        </h2>
                        {request.attachments.length === 0 ? (
                            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                No attachments.
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {request.attachments.map((attachment) => (
                                    <a
                                        key={attachment.id}
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex flex-col items-center gap-1.5 p-2 rounded-lg text-center"
                                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                                    >
                                        {attachment.mime_type?.startsWith('image/') ? (
                                            <img src={attachment.url} alt={attachment.original_filename} className="w-full h-16 object-cover rounded" />
                                        ) : (
                                            <FileIcon size={20} style={{ color: 'var(--color-muted)' }} />
                                        )}
                                        <span className="text-[10px] truncate w-full" style={{ color: 'var(--color-muted)' }}>
                                            {attachment.original_filename}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {CANCELLABLE.includes(request.status) && (
                        <button
                            onClick={cancel}
                            className="flex items-center gap-2 text-sm font-medium"
                            style={{ color: 'var(--color-danger)' }}
                        >
                            <XCircle size={15} />
                            Cancel this request
                        </button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
