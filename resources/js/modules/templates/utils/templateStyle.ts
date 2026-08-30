/**
 * Constants shared between the CSS-based on-screen preview (TemplatePreview.tsx) and the
 * canvas-based export that turns the same config into the final generated image
 * (renderTemplateImage.ts) — kept in one place so the two never drift apart.
 */

/** Matches the browser's default line-height-to-font-size ratio so unset fields wrap/space
 *  their lines the same amount in both places. */
export const DEFAULT_LINE_HEIGHT = 1.25;

export const TEMPLATE_FONT_FAMILY = "'Template Render Font', Inter, sans-serif";
