<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected ProductService $productService;

    /**
     * Dependency Injection (OOP Constructor Injection)
     */
    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * GET /api/products?search=...&category=...
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $category = $request->query('category');

        $products = $this->productService->list($search, $category);
        return response()->json($products);
    }

    /**
     * GET /api/products/{id}
     */
    public function show(int $id): JsonResponse
    {
        $product = $this->productService->getById($id);
        return response()->json($product);
    }

    /**
     * POST /api/products (Admin Only)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_featured' => 'nullable|boolean',
        ]);

        $imageFile = $request->file('image');
        $product = $this->productService->create($validated, $imageFile);

        return response()->json($product, 201);
    }

    /**
     * POST/PUT /api/products/{id} (Admin Only)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_featured' => 'nullable|boolean',
        ]);

        $imageFile = $request->file('image');
        $product = $this->productService->update($id, $validated, $imageFile);

        return response()->json($product);
    }

    /**
     * DELETE /api/products/{id} (Admin Only)
     */
    public function destroy(int $id): JsonResponse
    {
        $this->productService->delete($id);
        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }
}
