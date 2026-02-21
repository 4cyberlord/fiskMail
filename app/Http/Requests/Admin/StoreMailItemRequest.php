<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMailItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id'),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $user = User::find($value);
                    if (! $user?->hasRole('student')) {
                        $fail('The selected student is invalid.');
                    }
                },
            ],
            'item_type' => ['required', 'string', Rule::in(['package', 'letter', 'document'])],
            'carrier' => ['required', 'string', Rule::in(['amazon', 'usps', 'ups', 'fedex', 'other'])],
            'tracking_number' => ['nullable', 'string', 'max:255'],
            'is_sensitive' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'deadline' => ['required', 'date'],
            'notify' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'user_id' => 'student',
            'item_type' => 'item type',
            'tracking_number' => 'tracking number',
        ];
    }
}
