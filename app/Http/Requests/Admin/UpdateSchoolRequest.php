<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSchoolRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->user()?->isAdmin() ?? false;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:auto_schools,email,' . $this->route('school'),
            'phone' => 'required|string|max:20',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'The school name is required.',
            'name.string' => 'The school name must be a string.',
            'name.max' => 'The school name may not be greater than 255 characters.',
            'email.required' => 'The email is required.',
            'email.email' => 'The email must be a valid email address.',
            'email.unique' => 'The email has already been taken.',
            'phone.required' => 'The phone number is required.',
            'phone.string' => 'The phone number must be a string.',
            'phone.max' => 'The phone number may not be greater than 20 characters.',
        ];
    }
}
