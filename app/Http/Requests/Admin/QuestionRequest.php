<?php

namespace App\Http\Requests\Admin;

use App\Enums\QuestionType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class QuestionRequest extends FormRequest
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
            'text' => ['required', 'string'],
            'type' => ['required', Rule::enum(QuestionType::class)],
            'points' => ['required', 'integer', 'min:1'],
            'position' => ['required', 'integer', 'min:1'],
            'explanation' => ['nullable', 'string'],
            'answers' => [$this->isMethod('post') ? 'required' : 'sometimes', 'array', 'min:2'],
            'answers.*.id' => ['sometimes', 'nullable', 'integer'],
            'answers.*.text' => ['required', 'string'],
            'answers.*.is_correct' => ['required', 'boolean'],
        ];
    }

    /**
     * Vérifie la cohérence des bonnes réponses avec le type de question.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty() || ! $this->has('answers')) {
                    return;
                }

                $correctCount = collect($this->input('answers'))->filter(fn (array $answer): bool => (bool) $answer['is_correct'])->count();

                if ($correctCount === 0) {
                    $validator->errors()->add('answers', 'La question doit avoir au moins une bonne réponse.');
                }

                $type = QuestionType::from($this->input('type'));

                if ($type->hasSingleAnswer() && $correctCount > 1) {
                    $validator->errors()->add('answers', 'Ce type de question ne peut avoir qu\'une seule bonne réponse.');
                }

                if ($type === QuestionType::TrueFalse && count($this->input('answers')) !== 2) {
                    $validator->errors()->add('answers', 'Une question Vrai / Faux doit avoir exactement deux réponses.');
                }
            },
        ];
    }
}
