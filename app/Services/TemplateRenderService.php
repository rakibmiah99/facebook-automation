<?php

namespace App\Services;

use App\Models\Template;

/**
 * Pure PHP config → render-model mapper — the server-side counterpart of
 * resources/js/modules/templates/components/TemplatePreview.tsx's scaledStyle/scaledLength.
 *
 * TemplatePreview renders at a *shrunk* container width and scales pixel-space values down to
 * fit it (`scale = renderedWidth / template.width`). The server always renders at the template's
 * real pixel size, so this is the same mapping with scale fixed at 1 — a plain number or "*px"
 * string becomes "{n}px", a "*%" string is left untouched (already relative to the canvas).
 */
class TemplateRenderService
{
    /** Same default as templateStyle.ts's DEFAULT_LINE_HEIGHT. */
    private const DEFAULT_LINE_HEIGHT = 1.25;

    /** Same value as templateStyle.ts's TEMPLATE_FONT_FAMILY. */
    private const FONT_FAMILY = "'Template Render Font', Inter, sans-serif";

    /**
     * @param  array<string, mixed>  $values  Text-field overrides, keyed by field key.
     * @return array{width: int, height: int, fontFamily: string, background: array, fields: array}
     */
    public function build(Template $template, array $values): array
    {
        $config = $template->resolveConfigUrls();

        return [
            'width' => (int) $template->width,
            'height' => (int) $template->height,
            'fontFamily' => self::FONT_FAMILY,
            'background' => $this->resolveBackground($config['background'] ?? null),
            'fields' => array_map(
                fn (array $field) => $this->resolveField($field, $values),
                $config['fields'] ?? [],
            ),
        ];
    }

    /**
     * Mirrors TemplatePreview's root background handling: a color, or a full-bleed background
     * image (with the same neutral placeholder fallback while no image is set).
     */
    private function resolveBackground(?array $background): array
    {
        $type = $background['type'] ?? 'color';

        if ($type === 'image') {
            return [
                'type' => 'image',
                'url' => $background['url'] ?? null,
            ];
        }

        return [
            'type' => 'color',
            'color' => $background['value'] ?? '#ffffff',
        ];
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  array<string, mixed>  $values
     */
    private function resolveField(array $field, array $values): array
    {
        $style = $field['style'] ?? [];
        $type = $field['type'] ?? 'text';

        $resolved = [
            'key' => $field['key'] ?? null,
            'type' => $type,
            'css' => $this->styleToCss($this->resolveBox($style, $type)),
            'parentCss' => isset($field['parent_style']) && is_array($field['parent_style'])
                ? $this->styleToCss($this->resolveParentBox($field['parent_style']))
                : null,
        ];

        if ($type === 'image') {
            // Request override (an http(s) URL — see TemplateImageGenerateRequest) → the
            // field's configured default, same resolution order as text fields below and as
            // TemplatePreview.tsx's `values[field.key] ?? field.default`.
            $resolved['src'] = $values[$field['key'] ?? ''] ?? $field['default_url'] ?? null;
            $resolved['objectFit'] = $style['objectFit'] ?? 'cover';
        } else {
            $resolved['text'] = $values[$field['key'] ?? ''] ?? $field['default'] ?? '';
        }

        return $resolved;
    }

    /**
     * Builds the resolved CSS declaration list (property => value) for one field's box —
     * the server-side counterpart of TemplatePreview's scaledStyle(). `borderRadius` is
     * intentionally omitted: per TemplateFieldStyle's own doc comment it is "preview-only —
     * the server renderer draws square corners."
     *
     * @param  array<string, mixed>  $style
     * @return array<string, string>
     */
    private function resolveBox(array $style, string $type): array
    {
        $css = [
            'position' => 'absolute',
            'box-sizing' => 'border-box',
        ];

        foreach (['top', 'left', 'right', 'bottom', 'width', 'height'] as $key) {
            if (isset($style[$key])) {
                $css[$key] = $this->resolveLength($style[$key]);
            }
        }

        if ($type === 'image') {
            $css['overflow'] = 'hidden';
            $css['background-color'] = $style['backgroundColor'] ?? 'rgba(0,0,0,0.05)';
        } else {
            $css['white-space'] = 'pre-wrap';
            $css['font-family'] = self::FONT_FAMILY;
            $css['line-height'] = (string) ($style['lineHeight'] ?? self::DEFAULT_LINE_HEIGHT);

            if (isset($style['color'])) {
                $css['color'] = $style['color'];
            }

            if (isset($style['fontSize'])) {
                $css['font-size'] = $this->resolveLength($style['fontSize']);
            }

            if (isset($style['textAlign'])) {
                $css['text-align'] = $style['textAlign'];
            }

            if (isset($style['backgroundColor'])) {
                $css['background-color'] = $style['backgroundColor'];
            }
        }

        if (($style['display'] ?? null) === 'flex') {
            $css['display'] = 'flex';

            if (isset($style['alignItems'])) {
                $css['align-items'] = $this->mapFlexAlign($style['alignItems']);
            }

            if (isset($style['justifyContent'])) {
                $css['justify-content'] = $this->mapFlexAlign($style['justifyContent']);
            }
        }

        if (isset($style['borderColor'])) {
            $css['border-color'] = $style['borderColor'];
        }

        if (isset($style['borderWidth'])) {
            $css['border-width'] = $this->resolveLength($style['borderWidth']);
            $css['border-style'] = 'solid';
        }

        if (isset($style['padding'])) {
            $css['padding'] = $this->resolveLength($style['padding']);
        }

        // Drawn cover-fit behind the text/image content, on top of backgroundColor — see
        // template-json-guideline.md. resolveConfigUrls() has already turned the stored path
        // into a resolved `url('https://...')` string by this point.
        if (isset($style['backgroundImage'])) {
            $css['background-image'] = $style['backgroundImage'];
            $css['background-size'] = 'cover';
            $css['background-position'] = 'center';
        }

        return array_merge($css, $this->resolveMarginZIndexAndShadow($style));
    }

    /**
     * Resolves the optional wrapper `<div>`'s CSS from `field.parent_style` — the server-side
     * counterpart of TemplatePreview's parentStyle handling. Same style vocabulary as
     * resolveBox()'s field box, minus the type-specific decorations (white-space, font-family
     * default, image overflow/background fallback) since the wrapper isn't a text or image box
     * itself, just a positionable container around one. Always `position: absolute` — the
     * caller only invokes this when `parent_style` is actually present, matching TemplatePreview
     * always promoting the wrapper once `field.parent_style` exists.
     *
     * @param  array<string, mixed>  $parentStyle
     * @return array<string, string>
     */
    private function resolveParentBox(array $parentStyle): array
    {
        $css = [
            'position' => 'absolute',
            'box-sizing' => 'border-box',
        ];

        foreach (['top', 'left', 'right', 'bottom', 'width', 'height'] as $key) {
            if (isset($parentStyle[$key])) {
                $css[$key] = $this->resolveLength($parentStyle[$key]);
            }
        }

        if (isset($parentStyle['color'])) {
            $css['color'] = $parentStyle['color'];
        }

        if (isset($parentStyle['fontSize'])) {
            $css['font-size'] = $this->resolveLength($parentStyle['fontSize']);
        }

        if (isset($parentStyle['textAlign'])) {
            $css['text-align'] = $parentStyle['textAlign'];
        }

        if (isset($parentStyle['backgroundColor'])) {
            $css['background-color'] = $parentStyle['backgroundColor'];
        }

        if (($parentStyle['display'] ?? null) === 'flex') {
            $css['display'] = 'flex';

            if (isset($parentStyle['alignItems'])) {
                $css['align-items'] = $this->mapFlexAlign($parentStyle['alignItems']);
            }

            if (isset($parentStyle['justifyContent'])) {
                $css['justify-content'] = $this->mapFlexAlign($parentStyle['justifyContent']);
            }
        }

        if (isset($parentStyle['borderColor'])) {
            $css['border-color'] = $parentStyle['borderColor'];
        }

        if (isset($parentStyle['borderWidth'])) {
            $css['border-width'] = $this->resolveLength($parentStyle['borderWidth']);
            $css['border-style'] = 'solid';
        }

        if (isset($parentStyle['padding'])) {
            $css['padding'] = $this->resolveLength($parentStyle['padding']);
        }

        if (isset($parentStyle['backgroundImage'])) {
            $css['background-image'] = $parentStyle['backgroundImage'];
            $css['background-size'] = 'cover';
            $css['background-position'] = 'center';
        }

        return array_merge($css, $this->resolveMarginZIndexAndShadow($parentStyle));
    }

    /**
     * Shared tail applied to both a field's own box (resolveBox) and its optional wrapper
     * (resolveParentBox): margin, z-index, and box-shadow. z-index matters because every
     * field/wrapper is `position: absolute` — without it, stacking silently falls back to
     * `fields` array order, which is what let a later, larger field (e.g. a full-canvas overlay
     * image) paint over and hide an earlier one relying on z-index to stay on top.
     *
     * @param  array<string, mixed>  $style
     * @return array<string, string>
     */
    private function resolveMarginZIndexAndShadow(array $style): array
    {
        $css = [];

        $marginProperties = [
            'margin' => 'margin',
            'marginTop' => 'margin-top',
            'marginRight' => 'margin-right',
            'marginBottom' => 'margin-bottom',
            'marginLeft' => 'margin-left',
        ];

        foreach ($marginProperties as $key => $cssProperty) {
            if (isset($style[$key])) {
                $css[$cssProperty] = $this->resolveLength($style[$key]);
            }
        }

        if (isset($style['zIndex'])) {
            $css['z-index'] = (string) $style['zIndex'];
        }

        if (isset($style['boxShadow'])) {
            $css['box-shadow'] = $style['boxShadow'];
        }

        return $css;
    }

    /**
     * The server-side counterpart of TemplatePreview's scaledLength(), fixed at scale = 1: a
     * plain number or a numeric "*px"-style string becomes "{n}px"; a "*%" string passes through
     * unchanged (already relative to the canvas); anything else passes through as-is.
     */
    private function resolveLength(mixed $value): string
    {
        if (is_int($value) || is_float($value)) {
            return "{$value}px";
        }

        if (is_string($value)) {
            $trimmed = trim($value);

            if (str_ends_with($trimmed, '%')) {
                return $trimmed;
            }

            if (is_numeric($trimmed)) {
                return "{$trimmed}px";
            }

            // e.g. "12px" — extract the numeric portion, same as TS's parseFloat() fallback.
            if (preg_match('/^-?\d+(\.\d+)?/', $trimmed, $matches)) {
                return "{$matches[0]}px";
            }

            return $trimmed;
        }

        return (string) $value;
    }

    /**
     * Normalizes the human-friendly `alignItems`/`justifyContent` aliases documented in
     * resources/markdown/template-json-guideline.md ("top"/"bottom"/"left"/"right") into real
     * CSS flexbox keywords. Any value already valid as-is (e.g. "flex-start", "stretch",
     * "baseline") passes through unchanged.
     */
    private function mapFlexAlign(string $value): string
    {
        return match ($value) {
            'top', 'left' => 'flex-start',
            'bottom', 'right' => 'flex-end',
            default => $value,
        };
    }

    /**
     * @param  array<string, string>  $css
     */
    private function styleToCss(array $css): string
    {
        $declarations = [];

        foreach ($css as $property => $value) {
            $declarations[] = "{$property}: {$value}";
        }

        return implode('; ', $declarations).';';
    }
}
