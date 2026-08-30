<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PostIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => [
                'nullable', 'integer',
                Rule::exists('facebook_app_accounts', 'id')->where('user_id', $this->user()->id),
            ],
            'search' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'status' => ['nullable', Rule::in(['published', 'scheduled', 'failed'])],
            'post_type' => ['nullable', Rule::in(['all', 'text', 'image'])],
        ];
    }
}
