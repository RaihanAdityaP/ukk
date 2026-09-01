<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Str;

/**
 * Class CategoryService
 * Mewarisi BaseService (Inheritance)
 */
class CategoryService extends BaseService
{
    public function list()
    {
        return Category::withCount('products')->get();
    }

    public function create(array $data): Category
    {
        $data['slug'] = Str::slug($data['name']);
        return Category::create($data);
    }

    public function delete(int $id): void
    {
        $category = Category::findOrFail($id);
        $category->delete();
    }
}
