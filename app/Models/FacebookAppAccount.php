<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['facebook_app_id', 'user_id', 'account_id', 'account_name', 'access_token', 'link', 'fan_count'])]
#[Hidden(['access_token'])]
class FacebookAppAccount extends Model
{
    protected function casts(): array
    {
        return [
            'fan_count' => 'integer',
        ];
    }

    public function facebookApp(): BelongsTo
    {
        return $this->belongsTo(FacebookApp::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
