import { Head, Link } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '../../../shared/layouts/AppLayout';
import TemplateCard from '../components/TemplateCard';
import type { TemplateItem } from '../types/template';

interface Props {
    data: {
        common_templates: TemplateItem[];
        my_templates: TemplateItem[];
    };
}

export default function TemplatesIndex({ data }: Props) {
    const { common_templates, my_templates } = data;

    return (
        <AppLayout>
            <Head title="Templates" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 max-w-6xl mx-auto w-full space-y-8">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                Templates
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                                Customize a ready-made template or request a custom one built for you.
                            </p>
                        </div>

                        <Link
                            href={route('template-requests.create')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
                            style={{ background: 'var(--color-primary)', color: 'white' }}
                        >
                            <PlusCircle size={15} />
                            Request Custom Template
                        </Link>
                    </div>

                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                            Common Templates
                        </h2>

                        {common_templates.length === 0 ? (
                            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                                No common templates are available yet.
                            </p>
                        ) : (
                            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                                {common_templates.map((template) => (
                                    <TemplateCard key={template.id} template={template} />
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                            My Templates
                        </h2>

                        {my_templates.length === 0 ? (
                            <div
                                className="p-5 rounded-xl text-sm"
                                style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border-hover)', color: 'var(--color-muted)' }}
                            >
                                You don't have any custom templates yet. Submit a{' '}
                                <Link href={route('template-requests.create')} className="font-medium" style={{ color: 'var(--color-primary)' }}>
                                    custom template request
                                </Link>{' '}
                                and our team will design one and assign it to you.
                            </div>
                        ) : (
                            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                                {my_templates.map((template) => (
                                    <TemplateCard key={template.id} template={template} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
