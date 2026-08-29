import { useEffect, useRef, useState } from 'react';
import type { TemplateConfig, TemplateFieldStyle } from '../types/template';

interface TemplatePreviewProps {
    config: TemplateConfig;
    width: number;
    height: number;
    values: Record<string, string>;
    imagePreviews: Record<string, string>;
    /** Hidden fields always render here (they're drawn into the final generated image too, so the
     *  preview needs to show them to actually match). This only toggles the admin-only dashed
     *  outline/"Hidden" badge used to annotate them while designing — never shown to end users. */
    revealHidden?: boolean;
}

// Matches Intervention Image's Font default (see vendor/intervention/image/src/Typography/Font.php)
// so unset fields wrap/space their lines the same amount in both places.
const DEFAULT_LINE_HEIGHT = 1.25;

// Pixel-based style properties that need to be scaled down to the container's rendered size —
// the config itself is always authored in the template's real pixel dimensions. Matches the set
// TemplateRenderService.php treats as lengths server-side (resolveBox/drawBox).
const SCALED_KEYS = ['top', 'left', 'right', 'bottom', 'width', 'height', 'fontSize', 'borderWidth', 'borderRadius', 'padding'] as const;

/**
 * Resolves one length value the same way TemplateRenderService's resolveLength() does server-side:
 * a plain number or a "*px" string is template-pixel-space and needs scaling down to the preview's
 * rendered size; a "*%" string is already relative to the (correctly-sized) container, so the
 * browser resolves it for free and it's left untouched.
 */
function scaledLength(value: unknown, scale: number): unknown {
    if (typeof value === 'number') {
        return value * scale;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (trimmed.endsWith('%')) {
            return trimmed;
        }

        const numeric = parseFloat(trimmed);

        if (!Number.isNaN(numeric)) {
            return numeric * scale;
        }
    }

    return value;
}

/**
 * Scales a field's style to the preview container while keeping it a plain CSS object — every
 * key here is a real CSS property name, so it's spread straight onto the element below and the
 * browser does the box-model/alignment work TemplateRenderService.php replicates server-side.
 */
function scaledStyle(style: TemplateFieldStyle, scale: number): React.CSSProperties {
    const result: Record<string, unknown> = { ...style };

    for (const key of SCALED_KEYS) {
        if (result[key] !== undefined) {
            result[key] = scaledLength(result[key], scale);
        }
    }

    return result as React.CSSProperties;
}

/**
 * Renders an approximate client-side preview of a template by scaling its pixel-space field
 * coordinates to the container width, so it roughly matches what TemplateRenderService
 * produces server-side with Intervention Image. Deliberately CSS-based rather than a canvas
 * library, per the project guide's "no unnecessary canvas framework" direction.
 */
export default function TemplatePreview({ config, width, height, values, imagePreviews, revealHidden = false }: TemplatePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) setScale(entry.contentRect.width / width);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [width]);

    const background = config.background;
    const backgroundOverride = imagePreviews['background'];

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-lg"
            style={{
                aspectRatio: `${width} / ${height}`,
                background: background?.type === 'color' ? (background.value ?? '#ffffff') : '#e5e7eb',
                border: '1px solid var(--color-border)',
            }}
        >
            {background?.type === 'image' && (backgroundOverride || background.url) && (
                <img
                    src={backgroundOverride ?? background.url ?? undefined}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {config.fields?.map((field) => {
                if (field.hidden && !revealHidden) {
                    return null;
                }

                const style = scaledStyle(field.style, scale);
                const hiddenOutline: React.CSSProperties = field.hidden && revealHidden
                    ? { outline: '1px dashed var(--color-warning)', outlineOffset: 2 }
                    : {};

                const hiddenBadge = field.hidden && revealHidden && (
                    <span
                        className="absolute -top-4 left-0 text-[9px] font-semibold uppercase tracking-wide px-1 rounded whitespace-nowrap"
                        style={{ background: 'var(--color-warning)', color: '#111' }}
                    >
                        Hidden
                    </span>
                );

                if (field.type === 'image') {
                    const src = imagePreviews[field.key] ?? field.default_url ?? undefined;

                    return (
                        <div
                            key={field.key}
                            className="absolute overflow-hidden box-border"
                            style={{ ...style, ...hiddenOutline, background: field.style.backgroundColor ?? 'rgba(0,0,0,0.05)' }}
                        >
                            {hiddenBadge}
                            {src && (
                                <img
                                    src={src}
                                    alt={field.label}
                                    className="w-full h-full"
                                    style={{ objectFit: field.style.objectFit ?? 'cover' }}
                                />
                            )}
                        </div>
                    );
                }

                const text = values[field.key] ?? field.default ?? '';

                return (
                    <div
                        key={field.key}
                        className="absolute whitespace-pre-wrap box-border"
                        style={{
                            fontFamily: "'Template Render Font', Inter, sans-serif",
                            lineHeight: DEFAULT_LINE_HEIGHT,
                            ...style,
                            ...hiddenOutline,
                        }}
                    >
                        {hiddenBadge}
                        {text}
                    </div>
                );
            })}
        </div>
    );
}
