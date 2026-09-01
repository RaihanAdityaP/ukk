<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * GET /api/cart
     */
    public function index(Request $request): JsonResponse
    {
        $items = $this->cartService->listByUser($request->user()->id);
        return response()->json($items);
    }

    /**
     * POST /api/cart
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $item = $this->cartService->addItem(
            $request->user()->id,
            $validated['product_id'],
            $validated['quantity']
        );

        return response()->json($item, 201);
    }

    /**
     * PUT /api/cart/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = $this->cartService->updateQuantity(
            $request->user()->id,
            $id,
            $validated['quantity']
        );

        return response()->json($item);
    }

    /**
     * DELETE /api/cart/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->cartService->removeItem($request->user()->id, $id);
        return response()->json(['message' => 'Item berhasil dihapus dari keranjang.']);
    }

    /**
     * DELETE /api/cart (clear all)
     */
    public function clear(Request $request): JsonResponse
    {
        $this->cartService->clearCart($request->user()->id);
        return response()->json(['message' => 'Keranjang berhasil dikosongkan.']);
    }
}
