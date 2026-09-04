<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApiLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            // Names the issued token (e.g. "iphone-15", "n8n") so it can be told apart from a
            // user's other tokens later — optional, falls back to a generic name.
            'device_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
