<?php

namespace App\Http\Requests;

use App\Models\Template;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TemplateImageScheduleRequest extends FormRequest
{
    /** Top-level keys that control scheduling rather than being a field value override. */
    private const RESERVED_KEYS = ['values', 'page_id', 'caption', 'scheduled_at', 'comment_message'];

    public function authorize(): bool
    {
        return true;
    }

    /** Same flat-or-wrapped `values` handling as TemplateImageGenerateRequest. */
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
            'values' => ['nullable', 'array'],
            'values.*' => ['nullable', 'string', 'max:2000'],

            // Unlike generate-image's optional page_id, scheduling always targets exactly one
            // of the caller's own Facebook Pages — there's no "schedule but don't publish
            // anywhere" case.
            'page_id' => [
                'required', 'integer',
                Rule::exists('facebook_app_accounts', 'id')->where('user_id', $this->user()?->id),
            ],
            'caption' => ['nullable', 'string'],
            'comment_message' => ['nullable', 'string'],

            // Facebook's own native scheduling window: 10 minutes to 75 days from now.
            'scheduled_at' => ['required', 'date', 'after:now +10 minutes', 'before:now +75 days'],
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
            'scheduled_at.after' => 'Facebook requires scheduled posts to be at least 10 minutes in the future.',
            'scheduled_at.before' => 'Facebook does not allow scheduling posts more than 75 days in the future.',
        ];
    }
}
