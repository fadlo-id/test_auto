<?php

namespace App\Http\Requests;

use App\Models\Review;
use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        $school = $this->route('autoSchool');

        return $this->user()->can('create', [Review::class, $school]);
    }

    public function rules(): array
    {
        return [
            'rating'  => 'required|integer|between:1,5',
            'title'   => 'required|string|max:255',
            'content' => 'required|string|min:10|max:2000',
        ];
    }
}
