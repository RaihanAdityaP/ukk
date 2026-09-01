<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Validation\ValidationException;

/**
 * Class CartService
 * Mewarisi BaseService (Inheritance & Encapsulation)
 * Mengelola keranjang belanja pengguna dan validasi batas stok.
 */
class CartService extends BaseService
{
    /**
     * Ambil item keranjang milik user tertentu.
     */
    public function listByUser(int $userId)
    {
        return CartItem::with('product.category')
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    /**
     * Tambah item ke keranjang atau tambah quantity jika sudah ada.
     */
    public function addItem(int $userId, int $productId, int $quantity = 1): CartItem
    {
        $product = Product::findOrFail($productId);

        if ($quantity <= 0) {
            throw ValidationException::withMessages(['quantity' => 'Jumlah harus lebih dari 0.']);
        }

        $existing = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        $totalAfterAdd = ($existing ? $existing->quantity : 0) + $quantity;

        if ($totalAfterAdd > $product->stock) {
            $sisa = $product->stock - ($existing ? $existing->quantity : 0);
            $msg = $sisa > 0
                ? "Stok tidak cukup. Kamu sudah punya {$existing->quantity} di keranjang, sisa stok cuma {$sisa} lagi."
                : "Stok produk ini di keranjangmu sudah mencapai batas maksimal.";
            throw ValidationException::withMessages(['quantity' => $msg]);
        }

        if ($existing) {
            $existing->update(['quantity' => $totalAfterAdd]);
            return $existing->load('product');
        }

        return CartItem::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'quantity' => $quantity,
        ])->load('product');
    }

    /**
     * Update quantity item keranjang.
     */
    public function updateQuantity(int $userId, int $cartItemId, int $quantity): CartItem
    {
        if ($quantity < 1) {
            throw ValidationException::withMessages(['quantity' => 'Jumlah minimal 1.']);
        }

        $cartItem = CartItem::with('product')
            ->where('id', $cartItemId)
            ->where('user_id', $userId)
            ->firstOrFail();

        if ($quantity > $cartItem->product->stock) {
            throw ValidationException::withMessages([
                'quantity' => "Stok tidak cukup. Tersisa {$cartItem->product->stock} unit."
            ]);
        }

        $cartItem->update(['quantity' => $quantity]);
        return $cartItem;
    }

    /**
     * Hapus item dari keranjang.
     */
    public function removeItem(int $userId, int $cartItemId): void
    {
        $cartItem = CartItem::where('id', $cartItemId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $cartItem->delete();
    }

    /**
     * Kosongkan seluruh keranjang user.
     */
    public function clearCart(int $userId): void
    {
        CartItem::where('user_id', $userId)->delete();
    }
}
