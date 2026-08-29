import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '../../../../shared/layouts/AppLayout';
import { ASPECT_RATIO_OPTIONS } from '../../../template-requests/types/template-request';
import ConfigLivePreview from '../components/ConfigLivePreview';
import TemplateJsonGuidelineModal from '../components/TemplateJsonGuidelineModal';
import { useConfigPreview } from '../hooks/useConfigPreview';
import { AdminPendingRequestOption, AdminTemplateFormData, AdminUserOption, DEFAULT_CONFIG_TEMPLATE } from '../types/admin-template';

interface Props {
    data: {
        users: AdminUserOption[];
        pending_requests: AdminPendingRequestOption[];
    };
}

export default function AdminTemplateCreate({ data }: Props) {
    const { users, pending_requests } = data;
    const query = new URLSearchParams(window.location.search);

    const form = useForm<AdminTemplateFormData>({
        name: '',
        category: '',
        aspect_ratio: ASPECT_RATIO_OPTIONS[0].value,
        width: '1080',
        height: '1080',
        preview: null,
        config: DEFAULT_CONFIG_TEMPLATE,
        is_common: query.get('custom_template_request_id') ? false : true,
        is_premium: false,
        is_active: true,
        owner_id: query.get('owner_id') ?? '',
        custom_template_request_id: query.get('custom_template_request_id') ?? '',
    });

    const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.post(route('admin.templates.store'), { forceFormData: true });
    };

    const { config: previewConfig, error: previewError } = useConfigPreview(form.data.config);

    return (
        <AppLayout>
            <Head title="New Template" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
                    <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                        New Template
                    </h1>

                    <div className="space-y-6">
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
                                    placeholder="News, Promotion, Quote…"
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
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Preview image</label>
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
                            <textarea
                                rows={12}
                                value={form.data.config}
                                onChange={(e) => form.setData('config', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg text-xs font-mono outline-none"
                                style={{ background: 'var(--color-surface-2)', border: `1px solid ${form.errors.config ? 'var(--color-danger)' : 'var(--color-border)'}`, color: 'var(--color-text)' }}
                            />
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
                                    Assign to user
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

                        {pending_requests.length > 0 && (
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Link to a custom template request (optional)
                                </label>
                                <select
                                    value={form.data.custom_template_request_id}
                                    onChange={(e) => form.setData('custom_template_request_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                >
                                    <option value="">None</option>
                                    {pending_requests.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.title} ({r.user?.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                            style={{ background: 'var(--color-primary)', color: 'white', opacity: form.processing ? 0.6 : 1 }}
                        >
                            {form.processing ? 'Creating…' : 'Create Template'}
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
