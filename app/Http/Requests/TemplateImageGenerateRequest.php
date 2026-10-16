<?php

namespace App\Http\Requests;

use App\Models\Template;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TemplateImageGenerateRequest extends FormRequest
{
    /** Top-level keys that control posting rather than being a field value override. */
    private const RESERVED_KEYS = ['values', 'page_id', 'caption', 'scheduled_at', 'comment_message'];

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Accepts field overrides either wrapped under `values` (the documented shape, matching
     * `values_example` from GET /api/templates/{template}) or as flat top-level keys
     * (`{"headline": "...", "logo": "https://..."}`) — a caller building the body straight from
     * that `values_example` response tends to naturally send it flat. If `values` is already
     * present it wins as-is; flat keys are only folded in when it's absent, and the posting
     * controls (page_id/caption/scheduled_at/comment_message) are never folded in — they
     * validate as their own top-level fields regardless of which shape the field overrides
     * arrived in.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('values')) {
            return;
        }

        $fieldValues = collect($this->all())->except(self::RESERVED_KEYS)->all();

        if ($fieldValues !== []) {
            $this->merge(['values' => $fieldValues]);
        }
    }

    public function rules(): array
    {
        $rules = [
            // Overrides keyed by field key, same shape as the `values_example` returned by
            // GET /api/templates/{template} — text fields take plain text, image fields take an
            // image URL. The server renders the image itself, so no file upload here.
            'values' => ['nullable', 'array'],
            'values.*' => ['nullable', 'string', 'max:2000'],

            // Optional: publish the generated image to exactly one of the caller's own Facebook
            // Pages in the same request. Omit page_id to only generate the image.
            'page_id' => [
                'nullable', 'integer',
                Rule::exists('facebook_app_accounts', 'id')->where('user_id', $this->user()?->id),
            ],
            'caption' => ['nullable', 'string'],
            'comment_message' => ['nullable', 'string'],

            // Optional: omit to publish immediately. When given, the post is scheduled through
            // Facebook's own native scheduling, so it must fall within Facebook's window
            // (10 minutes to 75 days from now) and is used as-is. Only meaningful with a page_id.
            'scheduled_at' => [
                'nullable', 'date', 'after:now +10 minutes', 'before:now +75 days',
                Rule::prohibitedIf(fn () => blank($this->input('page_id'))),
            ],
        ];

        // {template} is already route-model-bound by the time FormRequest rules are evaluated
        // (SubstituteBindings runs before this). Image-field overrides must be an http(s) URL —
        // Browsershot/Chromium would otherwise happily load a `file://` value and leak local
        // server files into the screenshot.
        $template = $this->route('template');

        if ($template instanceof Template) {
            foreach ($template->config['fields'] ?? [] as $field) {
                if (($field['type'] ?? null) === 'image' && ! empty($field['key'])) {
                    $rules["values.{$field['key']}"] = ['nullable', 'string', 'max:2000', 'regex:/^https?:\/\//i'];
                }
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'values.*.regex' => 'The :attribute must be a valid http(s) image URL.',
            'page_id.exists' => 'The selected page was not found among your connected Facebook Pages.',
            'scheduled_at.prohibited' => 'A page_id is required to schedule a post.',
            'scheduled_at.after' => 'Facebook requires scheduled posts to be at least 10 minutes in the future.',
            'scheduled_at.before' => 'Facebook does not allow scheduling posts more than 75 days in the future.',
        ];
    }
}
