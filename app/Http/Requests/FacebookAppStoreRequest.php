<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FacebookAppStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'app_name' => ['required', 'string', 'max:255'],
            'app_id' => [
                'required',
                'string',
                'max:255',
                Rule::unique('facebook_apps')->where('user_id', $this->user()->id)->whereNull('deleted_at'),
            ],
            'app_secret' => ['required', 'string', 'max:255'],
            'app_token' => ['required', 'string', 'max:1000'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
