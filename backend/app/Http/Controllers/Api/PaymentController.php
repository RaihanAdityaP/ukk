<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * POST /api/payment/create-transaction
     * Body: { order_code }
     */
    public function createSnapToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_code' => 'required|string|exists:orders,order_code',
        ]);

        $order = Order::with('items')
            ->where('order_code', $validated['order_code'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $result = $this->paymentService->createSnapToken($order);

        return response()->json($result);
    }

    /**
     * POST /api/payment/notification (Webhook from Midtrans)
     */
    public function notification(Request $request): JsonResponse
    {
        $result = $this->paymentService->handleNotification();
        return response()->json($result);
    }
}
