<?php

namespace App\Models;

use App\Helpers\UtilsHelper;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['template_id', 'user_id', 'path', 'values'])]
#[Appends(['url', 'is_posted'])]
class TemplateGeneration extends Model
{
    protected function casts(): array
    {
        return [
            'values' => 'array',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => UtilsHelper::GetMediaUrl($this->path),
        );
    }

    protected function isPosted(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->relationLoaded('posts')
                ? $this->posts->isNotEmpty()
                : $this->posts()->exists(),
        );
    }
}
