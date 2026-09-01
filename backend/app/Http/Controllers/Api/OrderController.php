<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * GET /api/orders
     * Jika admin -> semua order. Jika customer -> order miliknya.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $orders = $this->orderService->listAll();
        } else {
            $orders = $this->orderService->listByUser($user->id);
        }

        return response()->json($orders);
    }

    /**
     * GET /api/orders/{code}
     */
    public function show(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $userId = $user->isAdmin() ? null : $user->id;

        $order = $this->orderService->getByCode($code, $userId);
        return response()->json($order);
    }

    /**
     * POST /api/orders/checkout
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_address' => 'required|string',
            'payment_method' => 'required|in:cod,transfer',
        ]);

        $order = $this->orderService->checkout($request->user(), $validated);

        return response()->json([
            'id' => $order->id,
            'order_code' => $order->order_code,
            'order' => $order,
        ], 201);
    }

    /**
     * PATCH /api/orders/{id}/status (Admin Only)
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,paid,shipped,done,cancelled',
        ]);

        $order = $this->orderService->updateStatus($id, $validated['status']);
        return response()->json($order);
    }
}
