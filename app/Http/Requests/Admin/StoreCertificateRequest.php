<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCertificateRequest extends FormRequest
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
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'formation_id' => [
                'required', 'integer', 'exists:formations,id',
                Rule::unique('certificates', 'formation_id')->where('user_id', $this->input('user_id')),
            ],
            'score' => ['required', 'integer', 'between:0,100'],
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
            'formation_id.unique' => 'Cet utilisateur possède déjà un certificat pour cette formation.',
        ];
    }
}
