<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubmitQuizAttemptRequest extends FormRequest
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
            'answers' => ['present', 'array'],
            'answers.*.question_id' => ['required', 'integer', 'distinct'],
            'answers.*.answer_ids' => ['present', 'array'],
            'answers.*.answer_ids.*' => ['integer'],
        ];
    }

    /**
     * Réponses indexées par identifiant de question.
     *
     * @return array<int, array<int, int>>
     */
    public function responses(): array
    {
        return collect($this->validated('answers'))
            ->mapWithKeys(fn (array $answer): array => [(int) $answer['question_id'] => $answer['answer_ids']])
            ->all();
    }
}
