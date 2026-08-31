<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PostCommentIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'commenter' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:255'],
        ];
    }
}
