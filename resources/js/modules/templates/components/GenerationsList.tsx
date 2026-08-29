import { Clock, ImageOff, ImagePlus, Send } from 'lucide-react';
import type { GenerationPost, TemplateGeneration } from '../types/template';

interface GenerationsListProps {
    generations: TemplateGeneration[];
    selectedId: number | null;
    onMakePost: (generation: TemplateGeneration) => void;
}

function postStatusLabel(post: GenerationPost): string {
    if (post.is_published) return 'Published';
    if (post.is_scheduled) return 'Scheduled';
    return 'Failed';
}

export default function GenerationsList({ generations, selectedId, onMakePost }: GenerationsListProps) {
    if (generations.length === 0) {
        return (
            <div
                className="rounded-2xl p-6 text-center"
                style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}
            >
                <ImagePlus size={20} className="mx-auto mb-2" style={{ color: 'var(--color-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Nothing generated yet — customize the template and click "Generate Image" to create your first one.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {generations.map((generation) => (
                <div
                    key={generation.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{
                        background: generation.id === selectedId ? 'var(--color-primary-dim)' : 'var(--color-surface)',
                        border: `1px solid ${generation.id === selectedId ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    }}
                >
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--color-surface-2)' }}>
                        {generation.url ? (
                            <img src={generation.url} alt="Generated" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ImageOff size={16} style={{ color: 'var(--color-muted)' }} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                                style={{
                                    background: generation.is_posted ? 'rgba(34,197,94,0.12)' : 'var(--color-surface-2)',
                                    color: generation.is_posted ? '#16a34a' : 'var(--color-muted)',
                                }}
                            >
                                {generation.is_posted ? 'Posted' : 'Not Posted'}
                            </span>
                            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                                <Clock size={11} />
                                {new Date(generation.created_at).toLocaleString()}
                            </span>
                        </div>

                        {!!generation.posts?.length && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {generation.posts.map((post) => (
                                    <span
                                        key={post.id}
                                        className="text-[10px] px-1.5 py-0.5 rounded"
                                        style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}
                                    >
                                        {post.facebook_app_account?.account_name ?? 'Unknown page'} · {postStatusLabel(post)}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => onMakePost(generation)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold flex-shrink-0 transition-opacity"
                        style={{ background: 'var(--color-primary)', color: 'white' }}
                    >
                        <Send size={12} />
                        Make Post
                    </button>
                </div>
            ))}
        </div>
    );
}
