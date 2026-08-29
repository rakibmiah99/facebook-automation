<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['facebook_app_account_id', 'user_id', 'template_id', 'template_generation_id', 'post_id', 'is_published', 'is_scheduled', 'scheduled_at', 'post_type'])]
class Post extends Model
{
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'is_scheduled' => 'boolean',
            'scheduled_at' => 'datetime',
        ];
    }

    public function facebookAppAccount(): BelongsTo
    {
        return $this->belongsTo(FacebookAppAccount::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function templateGeneration(): BelongsTo
    {
        return $this->belongsTo(TemplateGeneration::class);
    }

    public function content(): HasOne
    {
        return $this->hasOne(PostContent::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }
}
