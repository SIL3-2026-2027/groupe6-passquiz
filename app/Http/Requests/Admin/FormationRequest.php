<?php

namespace App\Http\Requests\Admin;

use App\Enums\FormationLevel;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class FormationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('formations', 'slug')->ignore($this->route('formation'))],
            'code' => ['required', 'string', 'alpha_num', 'max:10'],
            'description' => ['nullable', 'string'],
            'level' => ['required', Rule::enum(FormationLevel::class)],
            'is_published' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'image', 'max:2048'],
            'remove_image' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Génère le slug et le code (ex : LAR) à partir du titre lorsqu'ils ne sont pas fournis.
     */
    protected function prepareForValidation(): void
    {
        $title = (string) $this->input('title');

        $this->merge([
            'slug' => $this->filled('slug') ? Str::slug($this->input('slug')) : Str::slug($title),
            'code' => Str::upper($this->filled('code') ? $this->input('code') : Str::substr(Str::slug($title, ''), 0, 3)),
        ]);
    }
}
