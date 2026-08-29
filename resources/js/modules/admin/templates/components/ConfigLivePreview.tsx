import TemplatePreview from '../../../templates/components/TemplatePreview';
import type { TemplateConfig } from '../../../templates/types/template';

interface ConfigLivePreviewProps {
    config: TemplateConfig | null;
    error: string | null;
    width: number;
    height: number;
}

export default function ConfigLivePreview({ config, error, width, height }: ConfigLivePreviewProps) {
    return (
        <div className="space-y-2">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Live Preview
            </h2>

            <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                {config ? (
                    // Capped at the template's actual pixel width so the preview renders true-to-size
                    // (like the end-user customize page) instead of stretching to fill this section —
                    // it still shrinks further on narrower screens since TemplatePreview scales to
                    // whatever width this wrapper ends up with.
                    <div style={{ maxWidth: width ? `${width}px` : undefined, marginInline: 'auto' }}>
                        <TemplatePreview config={config} width={width || 1} height={height || 1} values={{}} imagePreviews={{}} revealHidden />
                    </div>
                ) : (
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        Start typing valid JSON to see a preview.
                    </p>
                )}
            </div>

            {error && (
                <p className="text-xs" style={{ color: 'var(--color-danger)' }}>
                    Invalid JSON — showing the last valid preview. {error}
                </p>
            )}

            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Uses each field's default value/color/position — exactly what a user sees before customizing. Fields
                outlined in orange are marked <strong>hidden</strong> — end users won't see or edit them, but they still
                render in generated images.
            </p>
        </div>
    );
}
