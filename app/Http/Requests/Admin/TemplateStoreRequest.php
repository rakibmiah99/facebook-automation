<?php

namespace App\Http\Requests\Admin;

use App\Rules\ValidTemplateConfigRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TemplateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'aspect_ratio' => ['required', 'string', 'max:50'],
            'width' => ['required', 'integer', 'min:1', 'max:8000'],
            'height' => ['required', 'integer', 'min:1', 'max:8000'],
            'preview' => ['nullable', 'image', 'max:8192'],
            'config' => ['required', 'json', new ValidTemplateConfigRule()],
            'is_common' => ['nullable', 'boolean'],
            'is_premium' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'owner_id' => ['nullable', 'required_if:is_common,false', Rule::exists('users', 'id')],
            'custom_template_request_id' => ['nullable', Rule::exists('custom_template_requests', 'id')],
        ];
    }
}
