import { Head, Link, useForm } from '@inertiajs/react';
import { File as FileIcon } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '../../../../shared/layouts/AppLayout';
import { STATUS_LABELS } from '../../../template-requests/types/template-request';
import type { AdminRequestDetail } from '../types/admin-template-request';

interface Props {
    data: {
        request: AdminRequestDetail;
    };
}

const STATUS_OPTIONS = ['submitted', 'under_review', 'in_progress', 'awaiting_info', 'completed', 'rejected', 'cancelled'];

export default function AdminTemplateRequestShow({ data }: Props) {
    const { request } = data;
    const status = STATUS_LABELS[request.status] ?? STATUS_LABELS.submitted;

    const form = useForm({
        status: request.status,
        admin_notes: request.admin_notes ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.template-requests.update', { customTemplateRequest: request.id }), { preserveScroll: true });
    };

    const buildTemplateUrl = route('admin.templates.create', {
        owner_id: request.user?.id,
        custom_template_request_id: request.id,
    });

    return (
        <AppLayout>
            <Head title={request.title} />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
                    <div>
                        <Link href={route('admin.template-requests.index')} className="text-xs" style={{ color: 'var(--color-muted)' }}>
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
                            {request.user?.name} ({request.user?.email}) · {request.aspect_ratio}
                            {request.width && request.height ? ` · ${request.width}×${request.height}` : ''} · {request.created_at}
                        </p>
                    </div>

                    <div className="rounded-2xl p-5 space-y-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Requirements</h2>
                        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-muted)' }}>{request.description}</p>
                    </div>

                    <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Reference files</h2>
                        {request.attachments.length === 0 ? (
                            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>No attachments.</p>
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

                    {request.templates.length > 0 && (
                        <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                            <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Templates built from this request</p>
                            <div className="flex flex-wrap gap-2">
                                {request.templates.map((template) => (
                                    <Link
                                        key={template.id}
                                        href={route('admin.templates.edit', { template: template.id })}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                                        style={{ background: 'var(--color-primary)', color: 'white' }}
                                    >
                                        {template.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <Link
                        href={buildTemplateUrl}
                        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg"
                        style={{ background: 'var(--color-primary)', color: 'white' }}
                    >
                        Build a template for this request
                    </Link>

                    <form
                        onSubmit={submit}
                        className="rounded-2xl p-5 space-y-4"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Update Status</h2>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Status</label>
                            <select
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{STATUS_LABELS[s]?.label ?? s}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Notes to customer</label>
                            <textarea
                                rows={4}
                                value={form.data.admin_notes}
                                onChange={(e) => form.setData('admin_notes', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none"
                                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                            style={{ background: 'var(--color-primary)', color: 'white', opacity: form.processing ? 0.6 : 1 }}
                        >
                            {form.processing ? 'Saving…' : 'Save'}
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
