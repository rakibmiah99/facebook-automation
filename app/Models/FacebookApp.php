<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Date;

#[Fillable(['user_id', 'app_name', 'app_id', 'app_secret', 'app_token', 'long_lived_token', 'long_lived_token_expiration', 'status'])]
#[Hidden(['app_secret', 'app_token', 'long_lived_token'])]
#[Appends(['has_long_lived_token', 'long_lived_token_expires_at', 'is_long_lived_token_valid'])]
class FacebookApp extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'long_lived_token_expiration' => 'integer',
        ];
    }

    protected function hasLongLivedToken(): Attribute
    {
        return Attribute::make(
            get: fn () => ! empty($this->long_lived_token),
        );
    }

    protected function longLivedTokenExpiresAt(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->long_lived_token_expiration
                ? Date::createFromTimestamp($this->long_lived_token_expiration)->toIso8601String()
                : null,
        );
    }

    protected function isLongLivedTokenValid(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->has_long_lived_token
                && $this->long_lived_token_expiration
                && $this->long_lived_token_expiration > Date::now()->timestamp,
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function accounts(): HasMany
    {
        return $this->hasMany(FacebookAppAccount::class);
    }
}
