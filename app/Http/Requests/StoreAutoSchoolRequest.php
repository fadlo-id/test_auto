<?php

namespace App\Http\Requests;

use App\Models\AutoSchool;
use Illuminate\Foundation\Http\FormRequest;

class StoreAutoSchoolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', AutoSchool::class);
    }

    public function rules(): array
    {
        return [
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string|max:2000',
            'email'            => 'required|email|max:255|unique:auto_schools,email',
            'phone'            => 'required|string|max:20',
            'address'          => 'required|string|max:255',
            'city'             => 'required|string|max:100',
            'region'           => 'nullable|string|max:100',
            'latitude'         => 'nullable|numeric|between:-90,90',
            'longitude'        => 'nullable|numeric|between:-180,180',
            'license_number'   => 'required|string|max:100|unique:auto_schools,license_number',
            'established_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'website_url'      => 'nullable|url|max:255',
            'facebook_url'     => 'nullable|url|max:255',
            'instagram_url'    => 'nullable|url|max:255',
            'categories'       => 'required|array|min:1',
            'categories.*'     => 'exists:categories,id',
        ];
    }
}
