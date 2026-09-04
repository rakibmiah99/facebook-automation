import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import JsonEditor from '../../../../shared/components/JsonEditor';
import AppLayout from '../../../../shared/layouts/AppLayout';
import type { TemplateConfig, TemplateItem } from '../../../templates/types/template';
import { ASPECT_RATIO_OPTIONS } from '../../../template-requests/types/template-request';
import ConfigLivePreview from '../components/ConfigLivePreview';
import TemplateJsonGuidelineModal from '../components/TemplateJsonGuidelineModal';
import { useConfigPreview } from '../hooks/useConfigPreview';
import { AdminTemplateFormData, AdminUserOption } from '../types/admin-template';

interface Props {
    data: {
        template: TemplateItem;
        users: AdminUserOption[];
        resolved_config: TemplateConfig;
    };
}

export default function AdminTemplateEdit({ data }: Props) {
    const { template, users, resolved_config } = data;

    const form = useForm<AdminTemplateFormData>({
        name: template.name,
        category: template.category ?? '',
        aspect_ratio: template.aspect_ratio,
        width: String(template.width),
        height: String(template.height),
        preview: null,
        config: JSON.stringify(template.config, null, 2),
        is_common: template.is_common,
        is_premium: template.is_premium,
        is_active: template.is_active,
        owner_id: template.owner_id ? String(template.owner_id) : '',
        custom_template_request_id: template.custom_template_request_id ? String(template.custom_template_request_id) : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.templates.update', { template: template.id }), { forceFormData: true });
    };

    const { config: previewConfig, error: previewError } = useConfigPreview(form.data.config, resolved_config);

    return (
        <AppLayout>
            <Head title={`Edit · ${template.name}`} />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p mx-auto w-full space-y-6">
                    <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                        Edit Template
                    </h1>

                    {template.preview_url && (
                        <img src={template.preview_url} alt={template.name} className="rounded-xl max-h-48 object-contain" />
                    )}

                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(460px,520px)_minmax(0,1fr)]">
                    <form
                        onSubmit={submit}
                        className="rounded-2xl p-6 space-y-5 h-fit"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Name</label>
                                <input
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--color-surface-2)', border: `1px solid ${form.errors.name ? 'var(--color-danger)' : 'var(--color-border)'}`, color: 'var(--color-text)' }}
                                />
                                {form.errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Category</label>
                                <input
                                    value={form.data.category}
                                    onChange={(e) => form.setData('category', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Aspect ratio</label>
                                <select
                                    value={form.data.aspect_ratio}
                                    onChange={(e) => form.setData('aspect_ratio', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                >
                                    {ASPECT_RATIO_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                    {!ASPECT_RATIO_OPTIONS.some((o) => o.value === form.data.aspect_ratio) && (
                                        <option value={form.data.aspect_ratio}>{form.data.aspect_ratio}</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Width (px)</label>
                                <input
                                    type="number"
                                    value={form.data.width}
                                    onChange={(e) => form.setData('width', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Height (px)</label>
                                <input
                                    type="number"
                                    value={form.data.height}
                                    onChange={(e) => form.setData('height', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Replace preview image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => form.setData('preview', e.target.files?.[0] ?? null)}
                                className="w-full text-xs"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                                    Config JSON (background + editable fields)
                                </label>
                                <TemplateJsonGuidelineModal />
                            </div>
                            <JsonEditor value={form.data.config} onChange={(v) => form.setData('config', v)} error={form.errors.config} />
                            {form.errors.config && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{form.errors.config}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm" style={{ color: 'var(--color-text)' }}>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.data.is_common} onChange={(e) => form.setData('is_common', e.target.checked)} />
                                Common (all users)
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.data.is_premium} onChange={(e) => form.setData('is_premium', e.target.checked)} />
                                Premium
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                                Active
                            </label>
                        </div>

                        {!form.data.is_common && (
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Assigned to
                                </label>
                                <select
                                    value={form.data.owner_id}
                                    onChange={(e) => form.setData('owner_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--color-surface-2)', border: `1px solid ${form.errors.owner_id ? 'var(--color-danger)' : 'var(--color-border)'}`, color: 'var(--color-text)' }}
                                >
                                    <option value="">Select a user…</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                                    ))}
                                </select>
                                {form.errors.owner_id && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{form.errors.owner_id}</p>}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                            style={{ background: 'var(--color-primary)', color: 'white', opacity: form.processing ? 0.6 : 1 }}
                        >
                            {form.processing ? 'Saving…' : 'Save Template'}
                        </button>
                    </form>

                    <ConfigLivePreview
                        config={previewConfig}
                        error={previewError}
                        width={Number(form.data.width)}
                        height={Number(form.data.height)}
                    />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
