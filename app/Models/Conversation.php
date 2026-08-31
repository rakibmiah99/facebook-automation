<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['facebook_app_account_id', 'conversation_id', 'participant_id', 'participant_name', 'participant_email', 'snippet', 'unread_count', 'message_count', 'link', 'conversation_updated_at'])]
class Conversation extends Model
{
    protected function casts(): array
    {
        return [
            'unread_count' => 'integer',
            'message_count' => 'integer',
            'conversation_updated_at' => 'datetime',
        ];
    }

    public function facebookAppAccount(): BelongsTo
    {
        return $this->belongsTo(FacebookAppAccount::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ConversationMessage::class)->orderBy('sent_at');
    }
}
