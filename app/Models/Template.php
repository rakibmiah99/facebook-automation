<?php

namespace App\Models;

use App\Helpers\UtilsHelper;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'category', 'aspect_ratio', 'width', 'height', 'preview_path', 'config',
    'is_common', 'is_premium', 'is_active', 'owner_id', 'created_by', 'custom_template_request_id',
])]
#[Appends(['preview_url'])]
class Template extends Model
{
    protected function casts(): array
    {
        return [
            'config' => 'array',
            'is_common' => 'boolean',
            'is_premium' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function customTemplateRequest(): BelongsTo
    {
        return $this->belongsTo(CustomTemplateRequest::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function generations(): HasMany
    {
        return $this->hasMany(TemplateGeneration::class);
    }

    protected function previewUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->preview_path
                ? UtilsHelper::GetMediaUrl($this->preview_path)
                : null,
        );
    }

    /**
     * Visible to any authenticated user: shared common templates and the caller's own assigned ones.
     */
    public function scopeVisibleTo($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('is_common', true)->orWhere('owner_id', $userId);
        });
    }

    /**
     * The stored config only holds relative storage paths for default images/backgrounds
     * (matching every other model in this app, see PostContent::contentUrl). Resolve those
     * to public URLs so previews (end-user editor, admin live preview) can render them
     * without duplicating the Media Helper's URL logic on the frontend.
     */
    public function resolveConfigUrls(): array
    {
        $config = $this->config ?? [];

        if (! empty($config['background']['path'])) {
            $config['background']['url'] = UtilsHelper::GetMediaUrl($config['background']['path']);
        }

        foreach ($config['fields'] ?? [] as $i => $field) {
            if (($field['type'] ?? null) === 'image' && ! empty($field['default'])) {
                $config['fields'][$i]['default_url'] = UtilsHelper::GetMediaUrl($field['default']);
            }
        }

        return $config;
    }
}
