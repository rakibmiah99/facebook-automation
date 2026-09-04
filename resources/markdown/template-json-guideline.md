# Template Config JSON Guideline

One JSON object per template, stored in `config`: a **background** plus a list of **fields**. `style` keys are plain CSS property names — this same object drives both the live preview and the final generated image.

## Shape

```json
{
  "background": { "type": "color", "value": "#111827", "editable": false },
  "fields": []
}
```

- `background` — optional, fills the canvas before any field is drawn.
- `fields` — required array, drawn on top of the background in order.

## Background

| Key | Notes |
| --- | --- |
| `type` | `"color"` or `"image"` |
| `value` | hex color, for `type: "color"` |
| `path` | storage path, for `type: "image"` — must already exist in media storage (no upload picker here; copy one from a previous generation) |
| `editable` | if `true`, the end user can replace the image at generate time |

```json
{ "type": "image", "path": "templates/2026/08/bg-abc123.webp", "editable": true }
```

## Fields

```json
{
  "key": "headline",
  "type": "text",
  "label": "Headline",
  "default": "Breaking News",
  "editable": true,
  "hidden": false,
  "style": {}
}
```

| Key | Notes |
| --- | --- |
| `key` | unique, stable identifier — matches user-submitted values when generating |
| `type` | `"text"` or `"image"` |
| `label` | shown above the input on the customize form |
| `default` | text value, or (image fields) a storage path — same path rule as background. `null` for an empty image field |
| `editable` | shows an input on the customize form; the user's value overrides `default` |
| `hidden` | no customize-form input, but still renders (using `default`) everywhere — preview and generated image alike. For fixed design elements |

`hidden: true` + `editable: true` is valid (an admin-only value), but `hidden` fields are usually `editable: false`.

## Field style

Every key is a real CSS property name (camelCase). Plain numbers are pixels in the template's real `width`/`height`; `"N%"` and `"Npx"` both work too.

| Property | Applies to | Notes |
| --- | --- | --- |
| `top` / `left` | text, image | box's top-left corner |
| `right` / `bottom` | text, image | position from the opposite edge; pair with `left`/`top` to derive `width`/`height` from the gap |
| `width` / `height` | text, image | required for image fields; on text, `height` only affects the box, not wrapping. Omit to shrink-to-fit |
| `color` | text | text color |
| `fontSize` | text | plain number or `"Npx"` |
| `textAlign` | text | `"left"` / `"center"` / `"right"` — ignored when `display: "flex"` |
| `display` | text | `"flex"` switches alignment to `alignItems`/`justifyContent` |
| `alignItems` | text, flex only | `"flex-start"`/`"top"`, `"center"`, `"flex-end"`/`"bottom"` |
| `justifyContent` | text, flex only | `"flex-start"`/`"left"`, `"center"`, `"flex-end"`/`"right"` |
| `lineHeight` | text | multiplier, e.g. `1.25` |
| `backgroundColor` | text, image | fills the box |
| `backgroundImage` | text, image | `"url('path')"` — same path rule as above; cover-fit, drawn over `backgroundColor` |
| `borderColor` / `borderWidth` | text, image | needs both to show |
| `borderRadius` | text, image | preview only — the generated image always has square corners |
| `padding` | text, image | inset between box edge and content |
| `margin` / `marginTop` / `marginRight` / `marginBottom` / `marginLeft` | text, image | offsets the box from its `top`/`left`/etc position — plain number or `"Npx"` |
| `zIndex` | text, image | stacking order. Every field/wrapper is individually positioned, so with no `zIndex` a later field in the `fields` array paints over an earlier one — set this whenever two fields' boxes can overlap and a specific one needs to stay on top |
| `boxShadow` | text, image | raw CSS `box-shadow` value, e.g. `"0px 6px 12px -2px rgba(0,0,0,0.25)"` — used as-is, not scaled |
| `objectFit` | image | `"cover"` (default) or `"contain"` |

## Parent style

Every field renders inside its own wrapper `<div>`. `parent_style` (optional, same property table as above minus `objectFit`) styles that wrapper instead of the field itself.

```json
{
  "key": "headline",
  "type": "text",
  "style": { "top": 0, "left": 0, "width": "100%", "color": "#ffffff", "fontSize": 48 },
  "parent_style": { "top": 40, "left": 40, "width": 600, "height": 100, "backgroundColor": "rgba(0,0,0,0.4)", "padding": 16 }
}
```

- Omitted → no wrapper styling, same as every existing template.
- Set any of `top`/`left`/`right`/`bottom`/`width`/`height` and the wrapper becomes a positioned box on the canvas; the field's own `style` then positions/sizes it **inside** that box — `parent_style` is the frame, `style` is what goes in it.
- Good for a background band or border sized differently than the field's own content box, without touching `style`.
- `borderRadius` on `parent_style` is preview only too — same rule as on `style`, the generated image always has square corners.

## Examples

Text field:

```json
{
  "key": "headline",
  "type": "text",
  "label": "Headline",
  "default": "Breaking News",
  "editable": true,
  "hidden": false,
  "style": { "top": 40, "left": 40, "width": 600, "color": "#ffffff", "fontSize": 48, "textAlign": "left", "lineHeight": 1.25 }
}
```

Image field, with a background box and border:

```json
{
  "key": "logo",
  "type": "image",
  "label": "Logo",
  "default": "templates/2026/08/logo-abc123.webp",
  "editable": true,
  "hidden": false,
  "style": {
    "top": 24, "left": 24, "width": 160, "height": 160,
    "backgroundColor": "#ffffff", "borderColor": "#e5e7eb", "borderWidth": 2,
    "borderRadius": 12, "padding": 8, "objectFit": "contain"
  }
}
```

Full config:

```json
{
  "background": { "type": "color", "value": "#111827", "editable": false },
  "fields": [
    {
      "key": "headline", "type": "text", "label": "Headline", "default": "Breaking News",
      "editable": true, "hidden": false,
      "style": { "top": 40, "left": 40, "width": 600, "color": "#ffffff", "fontSize": 48, "textAlign": "left", "lineHeight": 1.25 }
    },
    {
      "key": "watermark", "type": "text", "label": "Watermark", "default": "© Agamir Somoy",
      "editable": false, "hidden": true,
      "style": { "top": 1020, "left": 40, "width": 400, "color": "#ffffff", "fontSize": 14 }
    }
  ]
}
```

## Tips

- Keep `key` stable once a template is in use — renaming breaks existing generation history.
- Stay within the template's `width`/`height` — anything off-canvas won't be visible.
- No upload picker for storage paths (`background.path`, image `default`, `backgroundImage`) — generate the template once with that field `editable: true`, then reuse the resulting path.
- A path you type resolves live via `/images/<path>` for a quick local sanity check, but only actually renders once saved — the customize page and generated image pull the real URL from the server.
- Hidden fields show a dashed orange outline in this admin preview only — an authoring aid, invisible everywhere else.
- Check the **Live Preview** panel before publishing.
