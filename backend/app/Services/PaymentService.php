<?php

namespace App\Services;

use App\Models\Order;
use Exception;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

/**
 * Class PaymentService
 * Mewarisi BaseService (Inheritance & Payment Gateway Integration)
 * Menangani integrasi Midtrans Snap & Webhook Notification.
 */
class PaymentService extends BaseService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = (bool) config('midtrans.is_production');
        Config::$isSanitized = (bool) config('midtrans.is_sanitized');
        Config::$is3ds = (bool) config('midtrans.is_3ds');
    }

    /**
     * Buat Snap Token untuk transaksi order tertentu.
     */
    public function createSnapToken(Order $order): array
    {
        if ($order->snap_token) {
            return [
                'token' => $order->snap_token,
                'redirect_url' => "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$order->snap_token}"
            ];
        }

        $items = [];
        foreach ($order->items as $item) {
            $items[] = [
                'id' => (string) $item->product_id,
                'price' => (int) $item->price,
                'quantity' => (int) $item->quantity,
                'name' => mb_substr($item->product_name, 0, 50),
            ];
        }

        $params = [
            'transaction_details' => [
                'order_id' => $order->order_code,
                'gross_amount' => (int) $order->total,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name,
                'phone' => $order->customer_phone,
                'billing_address' => [
                    'address' => $order->customer_address,
                ],
            ],
            'item_details' => $items,
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            $order->update(['snap_token' => $snapToken]);

            return [
                'token' => $snapToken,
                'redirect_url' => "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$snapToken}"
            ];
        } catch (Exception $e) {
            throw new Exception("Gagal membuat transaksi Midtrans: " . $e->getMessage());
        }
    }

    /**
     * Menangani callback webhook notification dari Midtrans.
     */
    public function handleNotification(): array
    {
        $notif = new Notification();

        $transaction = $notif->transaction_status;
        $type = $notif->payment_type;
        $orderCode = $notif->order_id;
        $fraud = $notif->fraud_status;

        $order = Order::where('order_code', $orderCode)->first();
        if (!$order) {
            return ['status' => 'error', 'message' => 'Order not found'];
        }

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $order->update(['status' => 'pending']);
                } else {
                    $order->update(['status' => 'paid']);
                }
            }
        } else if ($transaction == 'settlement') {
            $order->update(['status' => 'paid']);
        } else if ($transaction == 'pending') {
            $order->update(['status' => 'pending']);
        } else if ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
            $order->update(['status' => 'cancelled']);
        }

        return ['status' => 'success', 'order_status' => $order->status];
    }
}
