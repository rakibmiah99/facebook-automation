import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarClock, Facebook, Send, TriangleAlert } from 'lucide-react';
import { route } from 'ziggy-js';
import FormField from '../../../shared/components/FormField';
import MultiLabelDropdown from '../../../shared/components/MultiLabelDropdown';
import Switch from '../../../shared/components/Switch';
import AppLayout from '../../../shared/layouts/AppLayout';
import CommentFields from '../components/CommentFields';
import type { PostAccountOption } from '../types/post';

interface Props {
    data: {
        accounts: PostAccountOption[];
    };
}

interface TextPostForm {
    account_ids: string[];
    content_text: string;
    is_scheduled: boolean;
    scheduled_at: string;
    add_comment: boolean;
    comment_message: string;
    comment_attachment: File | null;
}

export default function TextPost({ data }: Props) {
    const { accounts } = data;
    const form = useForm<TextPostForm>({
        account_ids: [],
        content_text: '',
        is_scheduled: false,
        scheduled_at: '',
        add_comment: false,
        comment_message: '',
        comment_attachment: null,
    });

    const accountOptions = accounts.map((a) => ({ value: String(a.id), label: a.account_name }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('posts.text.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Text Post" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                            Text Post
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                            Publish or schedule a text update to one or more Facebook Pages.
                        </p>
                    </div>

                    {accounts.length === 0 ? (
                        <div
                            className="flex items-start gap-3 p-3.5 rounded-lg"
                            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
                        >
                            <TriangleAlert size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>
                                You don't have any connected Facebook Pages yet. Go to{' '}
                                <Link href={route('facebook-apps.index')} className="font-medium" style={{ color: 'var(--color-primary)' }}>
                                    My Apps
                                </Link>{' '}
                                and fetch accounts from an app before creating a post.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <form onSubmit={submit} className="space-y-5">
                                <MultiLabelDropdown
                                    label="Post to"
                                    options={accountOptions}
                                    selected={form.data.account_ids}
                                    onChange={(vals) => form.setData('account_ids', vals)}
                                    placeholder="Select one or more pages"
                                    searchable
                                    searchPlaceholder="Search pages..."
                                />
                                {form.errors.account_ids && (
                                    <p className="text-xs -mt-3" style={{ color: 'var(--color-danger)' }}>
                                        {form.errors.account_ids}
                                    </p>
                                )}

                                <div>
                                    <label htmlFor="content_text" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                        Post content
                                    </label>
                                    <textarea
                                        id="content_text"
                                        rows={6}
                                        value={form.data.content_text}
                                        onChange={(e) => form.setData('content_text', e.target.value)}
                                        placeholder="What do you want to share?"
                                        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150 resize-none"
                                        style={{
                                            background: 'var(--color-surface-2)',
                                            border: `1px solid ${form.errors.content_text ? 'var(--color-danger)' : 'var(--color-border)'}`,
                                            color: 'var(--color-text)',
                                        }}
                                        onFocus={(e) => {
                                            if (!form.errors.content_text) {
                                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                                e.currentTarget.style.outline = '1px solid rgba(99,102,241,0.25)';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = form.errors.content_text ? 'var(--color-danger)' : 'var(--color-border)';
                                            e.currentTarget.style.outline = 'none';
                                        }}
                                    />
                                    {form.errors.content_text && (
                                        <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
                                            {form.errors.content_text}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                                    <div className="flex items-center gap-2.5">
                                        <CalendarClock size={16} style={{ color: 'var(--color-muted)' }} />
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                                Schedule for later
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                                Save without publishing immediately.
                                            </p>
                                        </div>
                                    </div>
                                    <Switch checked={form.data.is_scheduled} onChange={(v) => form.setData('is_scheduled', v)} />
                                </div>

                                {form.data.is_scheduled && (
                                    <FormField
                                        label="Scheduled at"
                                        id="scheduled_at"
                                        type="datetime-local"
                                        value={form.data.scheduled_at}
                                        onChange={(v) => form.setData('scheduled_at', v)}
                                        error={form.errors.scheduled_at}
                                    />
                                )}

                                <CommentFields
                                    checked={form.data.add_comment}
                                    onToggle={(v) => form.setData('add_comment', v)}
                                    message={form.data.comment_message}
                                    onMessageChange={(v) => form.setData('comment_message', v)}
                                    attachment={form.data.comment_attachment}
                                    onAttachmentChange={(file) => form.setData('comment_attachment', file)}
                                    messageError={form.errors.comment_message}
                                    attachmentError={form.errors.comment_attachment}
                                />

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                                    style={{
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        fontFamily: 'var(--font-display)',
                                        opacity: form.processing ? 0.6 : 1,
                                    }}
                                >
                                    {form.data.is_scheduled ? <CalendarClock size={15} /> : <Send size={15} />}
                                    {form.processing
                                        ? form.data.is_scheduled
                                            ? 'Scheduling…'
                                            : 'Publishing…'
                                        : form.data.is_scheduled
                                          ? 'Schedule Post'
                                          : 'Publish Now'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                        <Facebook size={13} style={{ color: '#1877F2' }} />
                        Posts are published directly to the selected Facebook Pages via the Graph API.
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
