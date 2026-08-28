<?php

namespace App\Models;

use App\Helpers\UtilsHelper;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['post_id', 'comment_id', 'message', 'attachment_path'])]
#[Appends(['attachment_url'])]
class PostComment extends Model
{
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    protected function attachmentUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attachment_path
                ? UtilsHelper::GetMediaUrl($this->attachment_path)
                : null,
        );
    }
}
