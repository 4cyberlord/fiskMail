<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class CompleteRegistrationRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'string', 'digits:7', 'unique:users,student_id'],
            'phone' => ['required', 'string', 'regex:/^\d{3}-\d{3}-\d{4}$/'],
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
            'student_id.digits' => 'Your Fisk Student ID must be exactly 7 digits.',
            'student_id.unique' => 'This Fisk Student ID is already registered.',
            'phone.regex' => 'Enter a valid phone number in the format 847-853-7485.',
        ];
    }
}
