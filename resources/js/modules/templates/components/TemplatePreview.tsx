import { useEffect, useRef, useState } from 'react';
import type { TemplateConfig } from '../types/template';

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

// Intervention Image treats (x, y) as an anchor point and picks which edge/center of the text
// box sits on it based on align/valign — not always the top-left corner. `translate()` moves a
// shrink-to-fit box by a percentage of its OWN rendered size, so pairing `left/top: x*scale,y*scale`
// with the matching translate reproduces that same anchor behavior without hand-rolling GD's
// per-line alignment math (the browser's own text-align already does that part).
const HORIZONTAL_ANCHOR: Record<string, string> = { left: '0%', center: '-50%', right: '-100%' };
const VERTICAL_ANCHOR: Record<string, string> = { top: '0%', middle: '-50%', bottom: '-100%' };

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
                const left = field.x * scale;
                const top = field.y * scale;
                const boxWidth = field.width * scale;
                const boxHeight = (field.height ?? field.font_size ?? 24) * scale;

                if (field.type === 'image') {
                    const src = imagePreviews[field.key] ?? field.default_url ?? undefined;

                    return (
                        <div
                            key={field.key}
                            className="absolute overflow-hidden"
                            style={{ left, top, width: boxWidth, height: boxHeight, background: 'rgba(0,0,0,0.05)' }}
                        >
                            {src && <img src={src} alt={field.label} className="w-full h-full object-cover" />}
                        </div>
                    );
                }

                const text = values[field.key] ?? field.default ?? '';
                const align = field.align ?? 'left';
                const valign = field.valign ?? 'top';

                return (
                    <div
                        key={field.key}
                        className="absolute whitespace-pre-wrap"
                        style={{
                            left,
                            top,
                            // `width: max-content` (not the default shrink-to-fit `auto`) so the box sizes to
                            // its own content — shrink-to-fit for an absolutely positioned box also factors in
                            // the distance from `left` to the containing block's edge, which wrongly starves
                            // fields anchored near the right/bottom before `maxWidth` ever gets a say.
                            width: 'max-content',
                            maxWidth: boxWidth,
                            transform: `translate(${HORIZONTAL_ANCHOR[align]}, ${VERTICAL_ANCHOR[valign]})`,
                            color: field.color ?? '#000000',
                            fontFamily: "'Template Render Font', Inter, sans-serif",
                            fontSize: (field.font_size ?? 32) * scale,
                            textAlign: align,
                            lineHeight: field.line_height ?? DEFAULT_LINE_HEIGHT,
                        }}
                    >
                        {text}
                    </div>
                );
            })}
        </div>
    );
}
