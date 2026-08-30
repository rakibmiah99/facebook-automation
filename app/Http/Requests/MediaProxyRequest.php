<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MediaProxyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'url' => ['required', 'string', 'url', 'regex:/^https?:\/\//i'],
        ];
    }
}
