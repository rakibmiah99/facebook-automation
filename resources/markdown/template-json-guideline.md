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
- **default** — for `type: "text"`, the default text shown/used. For `type: "image"`, a storage path to a default image (same caveat as background — must already be a valid path; leave it `null` if the field should start empty).
- **editable** — if `true`, the field shows an input on the customize form and the user's value/upload overrides the default when generating. If `false`, the default is always used and no input is shown.
- **hidden** — if `true`, the field is completely removed from what the end user sees: no input on the customize form, and it never appears in the customize preview or the page's data at all. It still renders normally in the final generated image using its `default`. Use this for fixed design elements (watermarks, decorative shapes, fixed logos) that shouldn't be visible or editable to the end user. Defaults to `false` when omitted.

A field can be both `hidden: true` and `editable: true` if you want an admin-only knob you fill in before saving, but end users never see it — though in practice `hidden` fields are almost always `editable: false`, since there's no one left to fill them in.

## Field style (CSS properties)

`style` positions and styles the field. Every key is a real CSS property name (camelCase). All
pixel values are in the template's actual `width`/`height` pixel space — the preview scales them
down to fit the screen automatically.

| Property          | Applies to    | Notes |
|--------------------|---------------|-------|
| `top`              | text, image   | **Required.** Y position of the box's top edge. |
| `left`             | text, image   | **Required.** X position of the box's left edge. |
| `width`            | text, image   | **Required.** Box width — text wraps within it; images are cropped/fit to it. |
| `height`           | image (required), text (optional) | Box height. For text, only affects the background/border box, not text wrapping. |
| `color`            | text          | Text color, hex (e.g. `"#ffffff"`). |
| `fontSize`         | text          | Font size in px. |
| `textAlign`        | text          | `"left"`, `"center"`, or `"right"`. |
| `lineHeight`       | text          | Line height multiplier (e.g. `1.25`). |
| `backgroundColor`  | text, image   | Fills the field's box behind the text/image. |
| `borderColor`      | text, image   | Box border color — needs `borderWidth` to actually show. |
| `borderWidth`      | text, image   | Border thickness in px. |
| `borderRadius`     | text, image   | Rounds the box corners **in the preview only** — the generated image always has square corners. |
| `padding`          | text, image   | Inset in px between the box edge and the text/image content. |
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

Image example, with a background box and border:

```json
{
  "key": "logo",
  "type": "image",
  "label": "Logo",
  "default": null,
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
- Fields marked `hidden` show a dashed orange outline in this admin preview so you can still see and adjust them — that outline never appears for end users or in generated images.
