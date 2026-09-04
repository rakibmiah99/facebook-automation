/**
 * Field styling, expressed as plain CSS property names (camelCase, same vocabulary as a React
 * `style` object) so it can be spread directly onto the preview's positioned box — see
 * TemplatePreview.tsx — instead of hand-mapping a bespoke set of keys. The renderer
 * (TemplateRenderService) reads this same object to draw the field server-side.
 */
/**
 * Every size/position value accepts a plain number (template pixels), a `"*px"` string, or a
 * `"*%"` string resolved against the canvas — see TemplateRenderService's resolveLength/resolveBox
 * for the server-side equivalent, and TemplatePreview's scaledStyle for how the client scales
 * these down to fit the preview container.
 */
type Length = number | string;

export interface TemplateFieldStyle {
    /** Top-left corner of the field's box, like CSS `position: absolute; top/left`. Optional since
     *  `right`/`bottom` can anchor the box from the opposite edge instead. */
    top?: Length;
    left?: Length;
    right?: Length;
    bottom?: Length;
    /** Required for image fields unless derivable from opposing edges (left+right/top+bottom);
     *  optional for text (only affects the background/border box, or is left to shrink-to-fit). */
    width?: Length;
    height?: Length;
    color?: string;
    fontSize?: Length;
    textAlign?: 'left' | 'center' | 'right';
    /** Switches a text field to flexbox alignment via alignItems/justifyContent instead of
     *  textAlign's always-top-anchored default — see TemplateRenderService's mapFlexAlign. */
    display?: 'flex';
    alignItems?: string;
    justifyContent?: string;
    lineHeight?: number;
    backgroundColor?: string;
    /** CSS `url('path')` syntax — same path rules as `default`/background image. */
    backgroundImage?: string;
    borderColor?: string;
    borderWidth?: Length;
    /** Preview-only — the server renderer draws square corners. */
    borderRadius?: Length;
    padding?: Length;
    margin?: Length;
    marginTop?: Length;
    marginRight?: Length;
    marginBottom?: Length;
    marginLeft?: Length;
    /** Stacking order relative to sibling fields/wrappers — matters since every field/wrapper is
     *  position: absolute, so paint order otherwise falls back to `fields` array order. */
    zIndex?: number;
    /** Raw CSS `box-shadow` shorthand, e.g. `"0px 6px 12px -2px rgba(0,0,0,0.25)"` — passed
     *  through as-is (not length-scaled) on both the preview and the generated image. */
    boxShadow?: string;
    /** Image fields only. */
    objectFit?: 'cover' | 'contain';
}

export interface TemplateField {
    key: string;
    type: 'text' | 'image';
    label: string;
    default?: string | null;
    default_url?: string | null;
    editable: boolean;
    /** True hides this field from the customize form only (see TemplateEdit's `editableFields`
     *  filter) — it still reaches the customize page and renders in the preview like any other
     *  field, since it's drawn into the final generated image too (see TemplateService::edit).
     *  `revealHidden` on TemplatePreview only adds the admin-only outline/"Hidden" badge on top. */
    hidden?: boolean;
    style: TemplateFieldStyle;
    /** Optional styling for the wrapper `<div>` this field is rendered inside — same style
     *  vocabulary as `style`, lets a field have its own positioned/decorated container (e.g. a
     *  background band or border) independent of the field's own box. Absent by default, which
     *  renders a plain, unstyled, non-positioned wrapper with no effect on layout — existing
     *  configs render unchanged. Setting any box property (top/left/right/bottom/width/height)
     *  promotes the wrapper to an absolutely positioned box on the canvas, same coordinate space
     *  as `style` — the field's own `style` then positions/sizes it *within* that wrapper.
     *  See TemplateRenderService's resolveParentBox for the server-side equivalent. */
    parent_style?: TemplateFieldStyle;
}

export interface TemplateBackground {
    type: 'color' | 'image';
    value?: string;
    path?: string | null;
    url?: string | null;
    editable: boolean;
}

export interface TemplateConfig {
    background?: TemplateBackground;
    fields: TemplateField[];
}

export interface TemplateItem {
    id: number;
    name: string;
    category: string | null;
    aspect_ratio: string;
    width: number;
    height: number;
    preview_path: string | null;
    preview_url: string | null;
    config: TemplateConfig;
    is_common: boolean;
    is_premium: boolean;
    is_active: boolean;
    owner_id: number | null;
    created_by: number | null;
    custom_template_request_id: number | null;
}

export interface TemplateAccountOption {
    id: number;
    account_name: string;
    link: string | null;
}

export interface GenerationPostAccount {
    id: number;
    account_name: string;
    link: string | null;
}

export interface GenerationPost {
    id: number;
    is_published: boolean;
    is_scheduled: boolean;
    scheduled_at: string | null;
    facebook_app_account: GenerationPostAccount | null;
}

export interface TemplateGeneration {
    id: number;
    path: string;
    url: string;
    is_posted: boolean;
    created_at: string;
    template_id?: number | null;
    user_id?: number;
    values?: Record<string, string> | null;
    posts?: GenerationPost[];
}
