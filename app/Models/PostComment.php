<?php

namespace App\Models;

use App\Helpers\UtilsHelper;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['post_id', 'parent_comment_id', 'comment_id', 'commenter_id', 'commenter_name', 'message', 'attachment_path', 'image_source_url', 'commented_at', 'is_automatic'])]
#[Appends(['attachment_url'])]
class PostComment extends Model
{
    protected function casts(): array
    {
        return [
            'commented_at' => 'datetime',
            'is_automatic' => 'boolean',
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * The comment this reply was made on. Null for top-level comments.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_comment_id');
    }

    /**
     * Replies made on this comment. A reply is just another PostComment row that
     * points back at its parent via parent_comment_id.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_comment_id')->orderBy('commented_at')->orderBy('created_at');
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
