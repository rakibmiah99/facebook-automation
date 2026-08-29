import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import FormField from '../../../shared/components/FormField';
import MultiLabelDropdown from '../../../shared/components/MultiLabelDropdown';
import Switch from '../../../shared/components/Switch';
import AppLayout from '../../../shared/layouts/AppLayout';
import type { SharedPageProps } from '../../../shared/types/shared';
import CommentFields from '../../posts/components/CommentFields';
import GenerationsList from '../components/GenerationsList';
import TemplatePreview from '../components/TemplatePreview';
import type { TemplateAccountOption, TemplateGeneration, TemplateItem } from '../types/template';

interface Props {
    data: {
        template: TemplateItem;
        accounts: TemplateAccountOption[];
        generations: TemplateGeneration[];
    };
}

interface GenerateForm {
    values: Record<string, string>;
    images: Record<string, File | null>;
}

interface PostForm {
    account_ids: string[];
    caption: string;
    is_scheduled: boolean;
    scheduled_at: string;
    add_comment: boolean;
    comment_message: string;
    comment_attachment: File | null;
}

const emptyPostForm: PostForm = {
    account_ids: [],
    caption: '',
    is_scheduled: false,
    scheduled_at: '',
    add_comment: false,
    comment_message: '',
    comment_attachment: null,
};

function StepPill({ n, label, active, done, disabled, onClick }: { n: number; label: string; active: boolean; done: boolean; disabled?: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity"
            style={{
                background: active ? 'var(--color-primary)' : done ? 'rgba(34,197,94,0.12)' : 'var(--color-surface-2)',
                color: active ? 'white' : done ? '#16a34a' : 'var(--color-muted)',
                border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
        >
            <span
                className="flex items-center justify-center w-4 h-4 rounded-full text-[10px]"
                style={{ background: active || done ? 'rgba(255,255,255,0.2)' : 'var(--color-border)' }}
            >
                {done && !active ? <Check size={10} /> : n}
            </span>
            {label}
        </button>
    );
}

export default function TemplateEdit({ data }: Props) {
    const { template, accounts, generations } = data;
    const { flash } = usePage<SharedPageProps>().props;
    const freshGeneration = (flash?.generated ?? null) as TemplateGeneration | null;

    const [step, setStep] = useState<1 | 2>(1);
    const [selectedGeneration, setSelectedGeneration] = useState<TemplateGeneration | null>(null);
    const lastHandledGenerationId = useRef<number | null>(null);

    const fields = useMemo(() => template.config.fields ?? [], [template.config.fields]);
    const backgroundEditable = template.config.background?.type === 'image' && template.config.background.editable;

    const generateForm = useForm<GenerateForm>({
        values: Object.fromEntries(fields.filter((f) => f.type === 'text').map((f) => [f.key, f.default ?? ''])),
        images: {},
    });

    const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});

    useEffect(() => {
        const urls: Record<string, string> = {};
        Object.entries(generateForm.data.images).forEach(([key, file]) => {
            if (file) urls[key] = URL.createObjectURL(file);
        });
        setImagePreviews(urls);
        return () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generateForm.data.images]);

    const setValue = (key: string, value: string) => {
        generateForm.setData('values', { ...generateForm.data.values, [key]: value });
    };

    const setImage = (key: string, file: File | null) => {
        generateForm.setData('images', { ...generateForm.data.images, [key]: file });
    };

    const submitGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        generateForm.post(route('templates.generate', { template: template.id }), {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
        });
    };

    // A successful "Generate" flashes the newly created row back; jump into step 2 with it selected.
    useEffect(() => {
        if (!freshGeneration || freshGeneration.id === lastHandledGenerationId.current) return;
        lastHandledGenerationId.current = freshGeneration.id;
        setSelectedGeneration(freshGeneration);
        setStep(2);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [freshGeneration]);

    const postForm = useForm<PostForm>(emptyPostForm);

    useEffect(() => {
        if (!selectedGeneration) return;
        postForm.setData({ ...emptyPostForm });
        postForm.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGeneration?.id]);

    const submitPost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGeneration) return;
        postForm.post(route('templates.generations.post', { template: template.id, generation: selectedGeneration.id }), {
            forceFormData: true,
        });
    };

    const goToPostStep = (generation: TemplateGeneration) => {
        setSelectedGeneration(generation);
        setStep(2);
    };

    const generateErrors = generateForm.errors as Record<string, string>;
    const accountOptions = accounts.map((a) => ({ value: String(a.id), label: a.account_name }));
    const editableFields = fields.filter((f) => f.editable && !f.hidden);

    return (
        <AppLayout>
            <Head title={`Customize · ${template.name}`} />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
                    <div>
                        <Link href={route('templates.index')} className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            ← Back to Templates
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                            {template.name}
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                            {template.aspect_ratio} · {template.width}×{template.height}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <StepPill n={1} label="Customize & Generate" active={step === 1} done={step === 2} onClick={() => setStep(1)} />
                        <div className="w-4 h-px" style={{ background: 'var(--color-border)' }} />
                        <StepPill
                            n={2}
                            label="Create Post"
                            active={step === 2}
                            done={false}
                            disabled={!selectedGeneration}
                            onClick={() => selectedGeneration && setStep(2)}
                        />
                    </div>

                    {step === 1 && (
                        <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(280px, 380px)' }}>
                            <div className="space-y-4">
                                <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                    <TemplatePreview
                                        config={template.config}
                                        width={template.width}
                                        height={template.height}
                                        values={generateForm.data.values}
                                        imagePreviews={imagePreviews}
                                    />
                                </div>
                            </div>

                            <form
                                onSubmit={submitGenerate}
                                className="rounded-2xl p-5 space-y-4 h-fit"
                                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                            >
                                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                    Customize
                                </h2>

                                {editableFields.length === 0 && !backgroundEditable && (
                                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                        This template has no editable elements — generate it as-is.
                                    </p>
                                )}

                                {editableFields.map((field) =>
                                    field.type === 'text' ? (
                                        <FormField
                                            key={field.key}
                                            id={field.key}
                                            label={field.label}
                                            value={generateForm.data.values[field.key] ?? ''}
                                            onChange={(v) => setValue(field.key, v)}
                                            error={generateErrors[`values.${field.key}`]}
                                        />
                                    ) : (
                                        <div key={field.key}>
                                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                                {field.label}
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setImage(field.key, e.target.files?.[0] ?? null)}
                                                className="w-full text-xs"
                                            />
                                            {generateErrors[`images.${field.key}`] && (
                                                <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
                                                    {generateErrors[`images.${field.key}`]}
                                                </p>
                                            )}
                                        </div>
                                    ),
                                )}

                                {backgroundEditable && (
                                    <div>
                                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                            Background image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImage('background', e.target.files?.[0] ?? null)}
                                            className="w-full text-xs"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={generateForm.processing}
                                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                                    style={{ background: 'var(--color-primary)', color: 'white', opacity: generateForm.processing ? 0.6 : 1 }}
                                >
                                    {generateForm.processing ? 'Generating…' : 'Generate Image'}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && selectedGeneration && (
                        <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(280px, 380px)' }}>
                            <div className="space-y-3">
                                <div
                                    className="rounded-2xl p-4 flex items-center justify-center"
                                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                                >
                                    <img src={selectedGeneration.url} alt="Generated" className="rounded-lg max-h-96 object-contain" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs font-medium"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    ← Generate a different variation
                                </button>
                            </div>

                            <form
                                onSubmit={submitPost}
                                className="rounded-2xl p-5 space-y-5 h-fit"
                                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                            >
                                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                    Create Post
                                </h2>

                                {accounts.length === 0 ? (
                                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                        Connect a Facebook Page under{' '}
                                        <Link href={route('facebook-apps.index')} style={{ color: 'var(--color-primary)' }}>
                                            My Apps
                                        </Link>{' '}
                                        before posting.
                                    </p>
                                ) : (
                                    <>
                                        <MultiLabelDropdown
                                            label="Post to"
                                            options={accountOptions}
                                            selected={postForm.data.account_ids}
                                            onChange={(vals) => postForm.setData('account_ids', vals)}
                                            placeholder="Select one or more pages"
                                            searchable
                                            searchPlaceholder="Search pages..."
                                        />
                                        {postForm.errors.account_ids && (
                                            <p className="text-xs -mt-3" style={{ color: 'var(--color-danger)' }}>
                                                {postForm.errors.account_ids}
                                            </p>
                                        )}

                                        <div>
                                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                                Caption (optional)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={postForm.data.caption}
                                                onChange={(e) => postForm.setData('caption', e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none"
                                                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                            />
                                        </div>

                                        <div
                                            className="flex items-center justify-between p-3 rounded-lg"
                                            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                                        >
                                            <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                                                Schedule for later
                                            </span>
                                            <Switch checked={postForm.data.is_scheduled} onChange={(v) => postForm.setData('is_scheduled', v)} />
                                        </div>

                                        {postForm.data.is_scheduled && (
                                            <FormField
                                                label="Scheduled at"
                                                id="scheduled_at"
                                                type="datetime-local"
                                                value={postForm.data.scheduled_at}
                                                onChange={(v) => postForm.setData('scheduled_at', v)}
                                                error={postForm.errors.scheduled_at}
                                            />
                                        )}

                                        <CommentFields
                                            checked={postForm.data.add_comment}
                                            onToggle={(v) => postForm.setData('add_comment', v)}
                                            message={postForm.data.comment_message}
                                            onMessageChange={(v) => postForm.setData('comment_message', v)}
                                            attachment={postForm.data.comment_attachment}
                                            onAttachmentChange={(file) => postForm.setData('comment_attachment', file)}
                                            messageError={postForm.errors.comment_message}
                                            attachmentError={postForm.errors.comment_attachment}
                                        />

                                        <button
                                            type="submit"
                                            disabled={postForm.processing || postForm.data.account_ids.length === 0}
                                            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                                            style={{ background: 'var(--color-primary)', color: 'white', opacity: postForm.processing ? 0.6 : 1 }}
                                        >
                                            {postForm.processing
                                                ? 'Submitting…'
                                                : postForm.data.is_scheduled
                                                  ? 'Schedule Post'
                                                  : 'Publish Now'}
                                        </button>
                                    </>
                                )}
                            </form>
                        </div>
                    )}

                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                            Your Generated Images
                        </h2>
                        <GenerationsList generations={generations} selectedId={selectedGeneration?.id ?? null} onMakePost={goToPostStep} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
