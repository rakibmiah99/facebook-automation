import { Head, useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '../../../shared/layouts/AppLayout';
import AttachmentUploader from '../components/AttachmentUploader';
import { ASPECT_RATIO_OPTIONS } from '../types/template-request';

interface RequestForm {
    title: string;
    aspect_ratio: string;
    width: string;
    height: string;
    description: string;
    attachments: File[];
}

export default function TemplateRequestCreate() {
    const form = useForm<RequestForm>({
        title: '',
        aspect_ratio: ASPECT_RATIO_OPTIONS[0].value,
        width: '',
        height: '',
        description: '',
        attachments: [],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('template-requests.store'), {
            forceFormData: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="New Custom Template Request" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 mx-auto w-full space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                            Request a Custom Template
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                            Describe what you need — our team will design it and assign it to your account.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="rounded-2xl p-6 space-y-5"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                        <div>
                            <label htmlFor="title" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Title
                            </label>
                            <input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="e.g. Daily News Template"
                                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: 'var(--color-surface-2)', border: `1px solid ${form.errors.title ? 'var(--color-danger)' : 'var(--color-border)'}`, color: 'var(--color-text)' }}
                            />
                            {form.errors.title && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
                                    {form.errors.title}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Template type / aspect ratio
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {ASPECT_RATIO_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => form.setData('aspect_ratio', option.value)}
                                        className="px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors duration-100"
                                        style={{
                                            background: form.data.aspect_ratio === option.value ? 'var(--color-primary-dim)' : 'var(--color-surface-2)',
                                            color: form.data.aspect_ratio === option.value ? 'var(--color-primary)' : 'var(--color-text)',
                                            border: `1px solid ${form.data.aspect_ratio === option.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="width" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Desired width (px, optional)
                                </label>
                                <input
                                    id="width"
                                    type="number"
                                    value={form.data.width}
                                    onChange={(e) => form.setData('width', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label htmlFor="height" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Desired height (px, optional)
                                </label>
                                <input
                                    id="height"
                                    type="number"
                                    value={form.data.height}
                                    onChange={(e) => form.setData('height', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Requirements
                            </label>
                            <textarea
                                id="description"
                                rows={6}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="Describe the design, text placement, brand/logo requirements, colors, style…"
                                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none"
                                style={{ background: 'var(--color-surface-2)', border: `1px solid ${form.errors.description ? 'var(--color-danger)' : 'var(--color-border)'}`, color: 'var(--color-text)' }}
                            />
                            {form.errors.description && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
                                    {form.errors.description}
                                </p>
                            )}
                        </div>

                        <AttachmentUploader
                            files={form.data.attachments}
                            onChange={(files) => form.setData('attachments', files)}
                            error={form.errors.attachments}
                        />

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                            style={{ background: 'var(--color-primary)', color: 'white', opacity: form.processing ? 0.6 : 1 }}
                        >
                            <Send size={15} />
                            {form.processing ? 'Submitting…' : 'Submit Request'}
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
