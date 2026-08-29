<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomTemplateRequestStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'aspect_ratio' => ['required', 'string', 'max:50'],
            'width' => ['nullable', 'integer', 'min:1', 'max:8000'],
            'height' => ['nullable', 'integer', 'min:1', 'max:8000'],
            'description' => ['required', 'string', 'max:5000'],

            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['file', 'mimes:jpg,jpeg,png,webp,gif,pdf', 'max:15360'],
        ];
    }
}
