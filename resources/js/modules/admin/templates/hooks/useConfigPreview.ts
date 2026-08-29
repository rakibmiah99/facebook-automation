import { useMemo, useRef } from 'react';
import type { TemplateConfig } from '../../../templates/types/template';

interface ConfigPreviewResult {
    /** Last successfully-parsed config, kept around so the preview doesn't blank out mid-edit. */
    config: TemplateConfig | null;
    error: string | null;
}

/**
 * Parses the raw JSON the admin is typing into a previewable TemplateConfig, overlaying resolved
 * image URLs from the template's last-saved state (raw config only ever stores relative storage
 * paths, which the browser can't turn into a URL on its own). If a path is edited to something new
 * it won't resolve to an image until the template is saved and reloaded — the preview falls back
 * to a placeholder box for it rather than breaking.
 */
export function useConfigPreview(jsonText: string, resolvedConfig?: TemplateConfig | null): ConfigPreviewResult {
    const lastValid = useRef<TemplateConfig | null>(null);

    return useMemo(() => {
        const urlMap = new Map<string, string>();
        if (resolvedConfig?.background?.path && resolvedConfig.background.url) {
            urlMap.set(resolvedConfig.background.path, resolvedConfig.background.url);
        }
        resolvedConfig?.fields?.forEach((field) => {
            if (field.default && field.default_url) {
                urlMap.set(field.default, field.default_url);
            }
        });

        try {
            const parsed = JSON.parse(jsonText);

            if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.fields)) {
                throw new Error('Config must be an object with a "fields" array');
            }

            const config: TemplateConfig = {
                ...parsed,
                background: parsed.background
                    ? { ...parsed.background, url: (parsed.background.path && urlMap.get(parsed.background.path)) ?? parsed.background.url }
                    : undefined,
                fields: parsed.fields.map((field: TemplateConfig['fields'][number]) => ({
                    ...field,
                    default_url: field.type === 'image' && field.default ? (urlMap.get(field.default) ?? field.default_url) : field.default_url,
                })),
            };

            lastValid.current = config;

            return { config, error: null };
        } catch (e) {
            return { config: lastValid.current, error: e instanceof Error ? e.message : 'Invalid JSON' };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jsonText, resolvedConfig]);
}
