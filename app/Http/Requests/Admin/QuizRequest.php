<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuizRequest extends FormRequest
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
            'formation_id' => [
                'required', 'integer', 'exists:formations,id',
                Rule::unique('quizzes', 'formation_id')->ignore($this->route('quiz')),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'passing_score' => ['required', 'integer', 'between:1,100'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'max_attempts' => ['nullable', 'integer', 'min:1'],
            'retry_delay_minutes' => ['nullable', 'integer', 'min:1'],
            'requires_course_completion' => ['sometimes', 'boolean'],
            'shuffle_questions' => ['sometimes', 'boolean'],
            'shuffle_answers' => ['sometimes', 'boolean'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'formation_id.unique' => 'Cette formation possède déjà une évaluation.',
        ];
    }
}
