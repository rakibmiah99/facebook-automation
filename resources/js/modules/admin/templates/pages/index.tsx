import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '../../../../shared/layouts/AppLayout';
import type { TemplateItem } from '../../../templates/types/template';

interface AdminTemplateItem extends TemplateItem {
    owner: { id: number; name: string; email: string } | null;
    custom_template_request: { id: number; title: string } | null;
}

interface Props {
    data: {
        templates: {
            data: AdminTemplateItem[];
            links: { url: string | null; label: string; active: boolean }[];
        };
    };
}

export default function AdminTemplatesIndex({ data }: Props) {
    const { templates } = data;

    const toggle = (template: AdminTemplateItem) => {
        router.post(route('admin.templates.toggle', { template: template.id }), {}, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Manage Templates" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                Manage Templates
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                                Common templates and custom templates assigned to users.
                            </p>
                        </div>

                        <Link
                            href={route('admin.templates.create')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
                            style={{ background: 'var(--color-primary)', color: 'white' }}
                        >
                            <PlusCircle size={15} />
                            New Template
                        </Link>
                    </div>

                    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        {templates.data.map((template, index) => (
                            <div
                                key={template.id}
                                className="flex items-center justify-between gap-4 px-4 py-3.5"
                                style={{ borderTop: index === 0 ? undefined : '1px solid var(--color-border)' }}
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                        {template.name}{' '}
                                        <span className="text-xs font-normal" style={{ color: 'var(--color-muted)' }}>
                                            ({template.aspect_ratio})
                                        </span>
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                        {template.is_common ? 'Common template' : `Assigned to ${template.owner?.name ?? 'unassigned'}`}
                                        {template.custom_template_request && ` · from request "${template.custom_template_request.title}"`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <button
                                        onClick={() => toggle(template)}
                                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={{
                                            background: template.is_active ? 'rgba(34,197,94,0.12)' : 'var(--color-surface-2)',
                                            color: template.is_active ? 'var(--color-success)' : 'var(--color-muted)',
                                        }}
                                    >
                                        {template.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                    <Link
                                        href={route('admin.templates.edit', { template: template.id })}
                                        className="text-xs font-semibold"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
