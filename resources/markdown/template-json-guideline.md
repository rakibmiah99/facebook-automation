# Template Config JSON Guideline

Every template is driven by one JSON object stored in its `config` column: a **background** plus
a list of **fields**. Each field's `style` uses plain CSS property names (the same vocabulary as a
React `style` object), so what you write here is what both the live preview and the final
generated image use to position and draw it.

## Top-level shape

```json
{
  "background": { "type": "color", "value": "#111827", "editable": false },
  "fields": [ ]
}
```

- **background** — optional. Fills the whole canvas before any field is drawn.
- **fields** — required array. Each entry is one text or image element drawn on top of the background, in the order listed.

## Background

- `type` — `"color"` or `"image"`.
- `value` — hex color, used when `type` is `"color"` (e.g. `"#111827"`).
- `path` — storage path of an uploaded image, used when `type` is `"image"`. This must already be a valid path known to the app's media storage — there is no upload picker in this JSON editor, so set it to a path you already have (for example, one produced by generating this template once with an editable background and copying the path from that generation).
  - The **Live Preview** shows whatever path you type immediately, even before saving. It resolves to `/images/<path>`, so it'll only actually display if that path exists under `public/images/` locally — a real storage path won't show a picture in this unsaved preview (there's no client-side way to know the storage disk's real URL yet), but it renders correctly everywhere else once saved: the saved template's live preview, the customize page, and the final generated image all pull the real resolved URL from the server.
- `editable` — if `true`, the end user can replace the background at generate time (uploads a new image, or for color backgrounds, nothing changes yet — only image backgrounds support a user-supplied replacement today).

```json
{ "type": "image", "path": "templates/2026/08/bg-abc123.webp", "editable": true }
```

## Fields

Each field:

```json
{
  "key": "headline",
  "type": "text",
  "label": "Headline",
  "default": "Breaking News",
  "editable": true,
  "hidden": false,
  "style": { }
}
```

- **key** — unique identifier for this field. Used to match up user-submitted values/images when generating, so keep it short and stable (e.g. `headline`, `logo`, `photo`).
- **type** — `"text"` or `"image"`.
- **label** — shown to the end user above their input on the customize form.
- **default** — for `type: "text"`, the default text shown/used. For `type: "image"`, a storage path to a default image, e.g. `"templates/2026/08/logo-abc123.webp"` — a bare relative path, **not** a full URL and **not** wrapped in `url(...)` (that wrapper is only for the `style.backgroundImage` CSS property below). Same caveat as background: this must already be a valid path known to the app's media storage — there is no upload picker in this JSON editor, so use a path you already have (e.g. one copied from a previous generation of this or another template). Leave it `null` if the field should start empty.
  - The **Live Preview** on this page shows whatever path you type immediately, even before saving — same as the background image (see above). It resolves to `/images/<path>`, so it'll only actually load if that path exists under `public/images/` locally; a real storage path (e.g. `templates/2026/08/logo-abc123.webp`) won't load a picture in this unsaved preview, but will render correctly everywhere else (the saved template's live preview, the customize page, and the final generated image), since those pull the real resolved URL from the server instead of guessing one client-side.
- **editable** — if `true`, the field shows an input on the customize form and the user's value/upload overrides the default when generating. If `false`, the default is always used and no input is shown.
- **hidden** — if `true`, the end user gets no input for this field on the customize form (it can't be edited or removed). It still **renders normally in the customize page's preview**, using its `default` — exactly as it will in the final generated image — so the preview never shows something different from what generate produces. Use this for fixed design elements (watermarks, decorative shapes, fixed logos, corner stamps) that shouldn't be editable but are still part of the visible design. Defaults to `false` when omitted.

A field can be both `hidden: true` and `editable: true` if you want an admin-only knob you fill in before saving, but end users can't touch it — though in practice `hidden` fields are almost always `editable: false`, since there's no one left to fill them in.

## Field style (CSS properties)

`style` positions and styles the field. Every key is a real CSS property name (camelCase), and the
generated image is rendered to match: plain numbers are pixels in the template's actual
`width`/`height` space (the preview just scales them down to fit the screen); `"N%"` strings
resolve against the canvas size; `"Npx"` strings work the same as a plain number.

| Property          | Applies to    | Notes |
|--------------------|---------------|-------|
| `top` / `left`     | text, image   | Y/X position of the box's top-left edge. Plain number, `"N%"`, or `"Npx"`. |
| `right` / `bottom` | text, image   | Position from the opposite edge instead of `top`/`left` — e.g. `bottom: 0` pins a field to the canvas's bottom edge. If both `left` and `right` (or `top` and `bottom`) are set, the box's `width`/`height` is derived from the gap between them. |
| `width` / `height` | text, image   | Box size. **Required for image fields** (text wraps within `width`; `height` on text only affects the background/border box, not wrapping). If omitted and not derivable from opposing edges, a field shrinks to fit its own content (like an unset CSS `width`/`height`) — used for e.g. a corner watermark anchored only by `right`/`bottom`. |
| `color`            | text          | Text color, hex (e.g. `"#ffffff"`). |
| `fontSize`         | text          | Font size — plain number or `"Npx"`. |
| `textAlign`        | text          | `"left"`, `"center"`, or `"right"`. Ignored on a field with `display: "flex"` in favor of `justifyContent`. |
| `display`          | text          | Set to `"flex"` to align content using `alignItems`/`justifyContent` instead of `textAlign`'s always-top-anchored default. |
| `alignItems`       | text (flex only) | Vertical alignment within the box: `"flex-start"`/`"top"`, `"center"`, or `"flex-end"`/`"bottom"`. |
| `justifyContent`   | text (flex only) | Horizontal alignment within the box: `"flex-start"`/`"left"`, `"center"`, or `"flex-end"`/`"right"`. |
| `lineHeight`       | text          | Line height multiplier (e.g. `1.25`). |
| `backgroundColor`  | text, image   | Fills the field's box behind the text/image. |
| `backgroundImage`  | text, image   | CSS `url('path')` syntax, e.g. `"url('templates/2026/08/bg-abc123.webp')"`. Same path rules as background/default image — must already be a valid storage path (or a full `https://` URL). Drawn cover-fit behind the text/image, on top of `backgroundColor`. |
| `borderColor`      | text, image   | Box border color — needs `borderWidth` to actually show. |
| `borderWidth`      | text, image   | Border thickness — plain number or `"Npx"`. |
| `borderRadius`     | text, image   | Rounds the box corners **in the preview only** — the generated image always has square corners. |
| `padding`          | text, image   | Inset between the box edge and the text/image content — plain number or `"Npx"`. |
| `objectFit`        | image         | `"cover"` (crop to fill, default) or `"contain"` (fit inside, may letterbox). |

Text example:

```json
{
  "key": "headline",
  "type": "text",
  "label": "Headline",
  "default": "Breaking News",
  "editable": true,
  "hidden": false,
  "style": {
    "top": 40,
    "left": 40,
    "width": 600,
    "color": "#ffffff",
    "fontSize": 48,
    "textAlign": "left",
    "lineHeight": 1.25
  }
}
```

Image example, with a background box and border. `default` is set to a real storage path here — a
fixed logo shown until the end user (if `editable: true`) uploads their own; use `null` instead if
the field should start with no image at all:

```json
{
  "key": "logo",
  "type": "image",
  "label": "Logo",
  "default": "templates/2026/08/logo-abc123.webp",
  "editable": true,
  "hidden": false,
  "style": {
    "top": 24,
    "left": 24,
    "width": 160,
    "height": 160,
    "backgroundColor": "#ffffff",
    "borderColor": "#e5e7eb",
    "borderWidth": 2,
    "borderRadius": 12,
    "padding": 8,
    "objectFit": "contain"
  }
}
```

## A complete example

```json
{
  "background": { "type": "color", "value": "#111827", "editable": false },
  "fields": [
    {
      "key": "headline",
      "type": "text",
      "label": "Headline",
      "default": "Breaking News",
      "editable": true,
      "hidden": false,
      "style": {
        "top": 40,
        "left": 40,
        "width": 600,
        "color": "#ffffff",
        "fontSize": 48,
        "textAlign": "left",
        "lineHeight": 1.25
      }
    },
    {
      "key": "watermark",
      "type": "text",
      "label": "Watermark",
      "default": "© Agamir Somoy",
      "editable": false,
      "hidden": true,
      "style": {
        "top": 1020,
        "left": 40,
        "width": 400,
        "color": "#ffffff",
        "fontSize": 14
      }
    }
  ]
}
```

## Tips

- Keep `key` values stable once a template is in use — renaming a key breaks any generation history that stored values under the old key.
- Positions and sizes should never exceed the template's `width`/`height` (set above the config editor) — a field placed off-canvas simply won't be visible.
- After saving, use the **Live Preview** panel next to this editor to check positioning before publishing the template.
- Fields marked `hidden` show a dashed orange outline in this admin preview so you can spot them at a glance — that outline is only an authoring aid and never appears for end users or in generated images; the field's actual content (text/image) renders normally everywhere, including the end-user customize preview.
- There's no upload picker for `background.path`, `field.default` (image fields), or `style.backgroundImage` in this JSON editor — the only way to get a real path today is to generate a template once (with the field/background set `editable: true`) and reuse the resulting generation's path.
