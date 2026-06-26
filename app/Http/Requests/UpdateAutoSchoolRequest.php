<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAutoSchoolRequest extends FormRequest
{
    public function authorize(): bool
    {
        $school = $this->route('autoSchool');

        return $this->user()->can('update', $school);
    }

    public function rules(): array
    {
        $school = $this->route('autoSchool');

        return [
            'name'             => 'sometimes|required|string|max:255',
            'description'      => 'nullable|string|max:2000',
            'email'            => ['sometimes', 'required', 'email', 'max:255', Rule::unique('auto_schools', 'email')->ignore($school)],
            'phone'            => 'sometimes|required|string|max:20',
            'address'          => 'sometimes|required|string|max:255',
            'city'             => 'sometimes|required|string|max:100',
            'region'           => 'nullable|string|max:100',
            'latitude'         => 'nullable|numeric|between:-90,90',
            'longitude'        => 'nullable|numeric|between:-180,180',
            'license_number'   => ['sometimes', 'required', 'string', 'max:100', Rule::unique('auto_schools', 'license_number')->ignore($school)],
            'established_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'website_url'      => 'nullable|url|max:255',
            'facebook_url'     => 'nullable|url|max:255',
            'instagram_url'    => 'nullable|url|max:255',
            'categories'       => 'sometimes|array|min:1',
            'categories.*'     => 'exists:categories,id',
        ];
    }
}
