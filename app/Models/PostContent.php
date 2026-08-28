<?php

namespace App\Models;

use App\Helpers\UtilsHelper;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['post_id', 'content_type', 'content_path', 'content_text'])]
#[Appends(['content_url'])]
class PostContent extends Model
{
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    protected function contentUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->content_path
                ? UtilsHelper::GetMediaUrl($this->content_path)
                : null,
        );
    }

}
