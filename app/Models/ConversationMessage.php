<?php

namespace App\Models;

use App\Helpers\UtilsHelper;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['conversation_id', 'message_id', 'is_from_page', 'sender_id', 'sender_name', 'message', 'attachment_path', 'attachment_source_url', 'attachment_type', 'sent_at'])]
#[Appends(['attachment_url'])]
class ConversationMessage extends Model
{
    protected function casts(): array
    {
        return [
            'is_from_page' => 'boolean',
            'sent_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    protected function attachmentUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attachment_path
                ? UtilsHelper::GetMediaUrl($this->attachment_path)
                : $this->attachment_source_url,
        );
    }
}
