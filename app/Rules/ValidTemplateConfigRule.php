<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Enforces the basic shape documented in resources/markdown/template-json-guideline.md: a valid
 * background, unique field keys, and the fields each field type needs (key/type/label/style).
 * Catching this at submission time keeps a structurally broken config (missing style, duplicate
 * keys) from ever reaching the preview/renderer. Deliberately does NOT enforce that style values
 * are pixel numbers — admins may still author with CSS percentages/units, which is on them to get
 * right; this rule only guards against configs that would crash rendering outright.
 */
class ValidTemplateConfigRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $config = is_string($value) ? json_decode($value, true) : $value;

        if (! is_array($config)) {
            $fail('The :attribute must be a JSON object.');

            return;
        }

        if (isset($config['background'])) {
            $this->validateBackground($config['background'], $fail);
        }

        if (! array_key_exists('fields', $config) || ! is_array($config['fields'])) {
            $fail('The :attribute must contain a "fields" array.');

            return;
        }

        $seenKeys = [];

        foreach ($config['fields'] as $index => $field) {
            $this->validateField($field, $index, $seenKeys, $fail);
        }
    }

    private function validateBackground(mixed $background, Closure $fail): void
    {
        if (! is_array($background)) {
            $fail('The :attribute background must be an object.');

            return;
        }

        $type = $background['type'] ?? null;

        if (! in_array($type, ['color', 'image'], true)) {
            $fail('The :attribute background.type must be "color" or "image".');

            return;
        }

        if ($type === 'color' && empty($background['value'])) {
            $fail('The :attribute background.value is required when background.type is "color".');
        }

        if ($type === 'image' && array_key_exists('path', $background) && $background['path'] !== null && ! is_string($background['path'])) {
            $fail('The :attribute background.path must be a string or null.');
        }
    }

    /**
     * @param  array<string, int>  $seenKeys
     */
    private function validateField(mixed $field, int $index, array &$seenKeys, Closure $fail): void
    {
        if (! is_array($field)) {
            $fail("The :attribute fields.{$index} must be an object.");

            return;
        }

        $key = $field['key'] ?? null;

        if (! is_string($key) || $key === '') {
            $fail("The :attribute fields.{$index}.key is required.");
        } elseif (isset($seenKeys[$key])) {
            $fail("The :attribute fields.{$index}.key \"{$key}\" duplicates fields.{$seenKeys[$key]}.key — field keys must be unique.");
        } else {
            $seenKeys[$key] = $index;
        }

        $type = $field['type'] ?? null;

        if (! in_array($type, ['text', 'image'], true)) {
            $fail("The :attribute fields.{$index}.type must be \"text\" or \"image\".");

            return;
        }

        if (empty($field['label']) || ! is_string($field['label'])) {
            $fail("The :attribute fields.{$index}.label is required.");
        }

        if (! is_array($field['style'] ?? null)) {
            $fail("The :attribute fields.{$index}.style is required.");
        }

        if (array_key_exists('parent_style', $field) && $field['parent_style'] !== null && ! is_array($field['parent_style'])) {
            $fail("The :attribute fields.{$index}.parent_style must be an object.");
        }
    }
}
