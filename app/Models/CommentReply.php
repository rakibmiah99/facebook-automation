<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['post_comment_id', 'reply_id', 'message', 'is_automatic'])]
class CommentReply extends Model
{
    protected function casts(): array
    {
        return [
            'is_automatic' => 'boolean',
        ];
    }

    public function comment(): BelongsTo
    {
        return $this->belongsTo(PostComment::class, 'post_comment_id');
    }
}
