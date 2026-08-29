<?php

namespace App\Models;

use App\Helpers\UtilsHelper;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['custom_template_request_id', 'path', 'original_filename', 'mime_type', 'size'])]
#[Appends(['url'])]
class CustomTemplateRequestAttachment extends Model
{
    public function customTemplateRequest(): BelongsTo
    {
        return $this->belongsTo(CustomTemplateRequest::class);
    }

    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => UtilsHelper::GetMediaUrl($this->path),
        );
    }
}
