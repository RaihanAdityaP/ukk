<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected CategoryService $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index(): JsonResponse
    {
        return response()->json($this->categoryService->list());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
        ]);

        $category = $this->categoryService->create($validated);
        return response()->json($category, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->categoryService->delete($id);
        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}
