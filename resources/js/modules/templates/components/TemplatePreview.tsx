import { useEffect, useRef, useState } from 'react';
import type { TemplateConfig, TemplateFieldStyle } from '../types/template';

interface TemplatePreviewProps {
    config: TemplateConfig;
    width: number;
    height: number;
    values: Record<string, string>;
    imagePreviews: Record<string, string>;
}

// Matches Intervention Image's Font default (see vendor/intervention/image/src/Typography/Font.php)
// so unset fields wrap/space their lines the same amount in both places.
const DEFAULT_LINE_HEIGHT = 1.25;

// Pixel-based style properties that need to be scaled down to the container's rendered size —
// the config itself is always authored in the template's real pixel dimensions.
const SCALED_KEYS = ['top', 'left', 'width', 'height', 'fontSize', 'borderWidth', 'borderRadius', 'padding'] as const;

/**
 * Scales a field's style to the preview container while keeping it a plain CSS object — every
 * key here is a real CSS property name, so it's spread straight onto the element below and the
 * browser does the box-model/alignment work TemplateRenderService.php replicates server-side.
 */
function scaledStyle(style: TemplateFieldStyle, scale: number): React.CSSProperties {
    const result: Record<string, unknown> = { ...style };

    for (const key of SCALED_KEYS) {
        if (typeof result[key] === 'number') {
            result[key] = (result[key] as number) * scale;
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
export default function TemplatePreview({ config, width, height, values, imagePreviews }: TemplatePreviewProps) {
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
                const style = scaledStyle(field.style, scale);

                if (field.type === 'image') {
                    const src = imagePreviews[field.key] ?? field.default_url ?? undefined;

                    return (
                        <div
                            key={field.key}
                            className="absolute overflow-hidden box-border"
                            style={{ ...style, background: field.style.backgroundColor ?? 'rgba(0,0,0,0.05)' }}
                        >
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
                        }}
                    >
                        {text}
                    </div>
                );
            })}
        </div>
    );
}
