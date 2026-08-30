<?php

namespace App\Models;

use App\Helpers\UtilsHelper;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['post_id', 'comment_id', 'commenter_id', 'commenter_name', 'message', 'attachment_path', 'image_source_url', 'commented_at'])]
#[Appends(['attachment_url'])]
class PostComment extends Model
{
    protected function casts(): array
    {
        return [
            'commented_at' => 'datetime',
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(CommentReply::class);
    }

    protected function attachmentUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attachment_path
                ? UtilsHelper::GetMediaUrl($this->attachment_path)
                : $this->image_source_url,
        );
    }
}
