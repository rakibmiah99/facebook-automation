<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PostImageStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_ids' => ['required', 'array', 'min:1'],
            'account_ids.*' => [
                'integer',
                Rule::exists('facebook_app_accounts', 'id')->where('user_id', $this->user()->id),
            ],
            'caption' => ['nullable', 'string'],
            'image' => ['required', 'image', 'max:8192'],
            'is_scheduled' => ['nullable', 'boolean'],
            'scheduled_at' => ['nullable', 'required_if:is_scheduled,true', 'date', 'after:now'],

            'add_comment' => ['nullable', 'boolean'],
            'comment_message' => [
                'nullable', 'string',
                Rule::when($this->boolean('add_comment'), ['required_without:comment_attachment']),
            ],
            'comment_attachment' => [
                'nullable', 'image', 'max:8192',
                Rule::when($this->boolean('add_comment'), ['required_without:comment_message']),
            ],
        ];
    }
}
