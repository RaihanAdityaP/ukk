<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Class OrderService
 * Mewarisi BaseService (Inheritance & DB Transactions)
 * Menangani checkout atomik, pemotongan stok otomatis, dan riwayat pesanan.
 */
class OrderService extends BaseService
{
    /**
     * Ambil semua order (Admin).
     */
    public function listAll()
    {
        return Order::with(['items', 'user'])
            ->latest()
            ->get();
    }

    /**
     * Ambil daftar order milik user tertentu.
     */
    public function listByUser(int $userId)
    {
        return Order::with('items')
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    /**
     * Ambil detail order by ID atau order_code.
     */
    public function getByCode(string $orderCode, ?int $userId = null): Order
    {
        $query = Order::with(['items', 'user'])->where('order_code', $orderCode);
        if ($userId) {
            $query->where('user_id', $userId);
        }
        return $query->firstOrFail();
    }

    /**
     * Proses Checkout Keranjang Belanja menjadi Order secara atomik.
     */
    public function checkout(User $user, array $input): Order
    {
        return $this->transaction(function () use ($user, $input) {
            // Ambil semua item keranjang user
            $cartItems = CartItem::with('product')
                ->where('user_id', $user->id)
                ->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Keranjang belanja kosong.'
                ]);
            }

            $total = 0;

            // Validasi ketersediaan stok untuk setiap item
            foreach ($cartItems as $item) {
                if (!$item->product) {
                    throw ValidationException::withMessages([
                        'product' => "Produk sudah tidak tersedia."
                    ]);
                }
                if ($item->quantity > $item->product->stock) {
                    throw ValidationException::withMessages([
                        'stock' => "Stok produk {$item->product->name} tidak mencukupi (tersisa {$item->product->stock})."
                    ]);
                }
                $total += $item->product->price * $item->quantity;
            }

            // Generate Order Code Unik: ORD-YYYYMMDD-XXXX
            $orderCode = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            // Buat Order
            $order = Order::create([
                'order_code' => $orderCode,
                'user_id' => $user->id,
                'customer_name' => $input['customer_name'] ?? $user->name,
                'customer_phone' => $input['customer_phone'] ?? $user->phone ?? '',
                'customer_address' => $input['customer_address'] ?? $user->address ?? '',
                'payment_method' => $input['payment_method'] ?? 'cod',
                'total' => $total,
                'status' => 'pending',
            ]);

            // Buat Order Items & Kurangi Stok Produk
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'price' => $item->product->price,
                    'quantity' => $item->quantity,
                ]);

                // Kurangi stok produk
                $item->product->decrement('stock', $item->quantity);
            }

            // Hapus isi keranjang user
            CartItem::where('user_id', $user->id)->delete();

            // Sync ke Supabase Database
            SupabaseSyncService::syncOrder($order);

            ActivityLogService::record(
                $user->id,
                'CHECKOUT_ORDER',
                "Customer {$order->customer_name} melakukan checkout order #{$order->order_code} senilai Rp " . number_format($order->total, 0, ',', '.'),
                ['order_code' => $order->order_code, 'total' => $order->total, 'items_count' => count($cartItems)]
            );

            return $order->load('items');
        });
    }

    /**
     * Update status order (Admin).
     */
    public function updateStatus(int $orderId, string $status): Order
    {
        $validStatuses = ['pending', 'paid', 'shipped', 'done', 'cancelled'];
        if (!in_array($status, $validStatuses)) {
            throw ValidationException::withMessages(['status' => 'Status tidak valid.']);
        }

        $order = Order::findOrFail($orderId);
        $order->update(['status' => $status]);

        ActivityLogService::record(
            auth()->id(),
            'UPDATE_ORDER_STATUS',
            "Admin mengubah status order #{$order->order_code} menjadi '{$status}'",
            ['order_id' => $order->id, 'order_code' => $order->order_code, 'status' => $status]
        );

        return $order->fresh(['items', 'user']);
    }
}
