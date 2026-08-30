<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TemplateGenerateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Rendered client-side (see resources/js/modules/templates/utils/renderTemplateImage.ts)
            // from the same config the preview uses, then uploaded as-is — the server just stores it.
            'generated_image' => ['required', 'image', 'max:8192'],
            'values' => ['nullable', 'array'],
            'values.*' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
