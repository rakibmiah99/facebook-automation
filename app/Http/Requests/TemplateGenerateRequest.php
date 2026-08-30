<?php

namespace App\Http\Requests;

use App\Models\Template;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class TemplateGenerateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Screenshotted client-side from the same config the preview uses (see
            // templates/pages/edit.tsx), then uploaded as-is — the server just stores it.
            'generated_image' => ['required', 'image', 'max:8192'],
            'values' => ['nullable', 'array'],
            'values.*' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Validation failures here are usually silent to the server (Laravel doesn't log them by
     * default) but still worth a laravel.log entry — the most common cause is the browser's
     * screenshot exceeding `upload_max_filesize`/`post_max_size`, which fails PHP's own upload
     * handling before Laravel's `image`/`max` rules even run, and needs the raw upload error
     * code below to diagnose.
     */
    protected function failedValidation(Validator $validator): void
    {
        $file = $this->file('generated_image');
        $template = $this->route('template');

        Log::error('Template image generation failed validation.', [
            'template_id' => $template instanceof Template ? $template->id : $template,
            'user_id' => $this->user()?->id,
            'errors' => $validator->errors()->toArray(),
            'upload_error' => $file ? $file->getErrorMessage() : 'No file was received.',
        ]);

        parent::failedValidation($validator);
    }
}
