import { Link } from '@inertiajs/react';
import { ImageOff, Sparkles, SquarePen } from 'lucide-react';
import { route } from 'ziggy-js';
import type { TemplateItem } from '../types/template';

interface TemplateCardProps {
    template: TemplateItem;
}

export default function TemplateCard({ template }: TemplateCardProps) {
    return (
        <div
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
            <div
                className="relative flex items-center justify-center"
                style={{ aspectRatio: `${template.width} / ${template.height}`, background: 'var(--color-surface-2)' }}
            >
                {template.preview_url ? (
                    <img src={template.preview_url} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                    <ImageOff size={22} style={{ color: 'var(--color-muted)' }} />
                )}

                <span
                    className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{
                        background: template.is_common ? 'var(--color-primary-dim)' : 'rgba(245,158,11,0.15)',
                        color: template.is_common ? 'var(--color-primary)' : 'var(--color-warning)',
                    }}
                >
                    {template.is_common ? 'Common' : 'My Template'}
                </span>

                {template.is_premium && (
                    <span
                        className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary)' }}
                    >
                        <Sparkles size={10} /> Premium
                    </span>
                )}
            </div>

            <div className="p-3.5 flex flex-col gap-2 flex-1">
                <div>
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                        {template.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        {template.category ?? 'General'} · {template.aspect_ratio} · {template.width}×{template.height}
                    </p>
                </div>

                <Link
                    href={route('templates.edit', { template: template.id })}
                    className="mt-auto flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-opacity"
                    style={{ background: 'var(--color-primary)', color: 'white' }}
                >
                    <SquarePen size={13} />
                    Customize
                </Link>
            </div>
        </div>
    );
}
