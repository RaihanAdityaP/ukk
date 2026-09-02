<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Class SupabaseSyncService
 * Mewarisi BaseService (OOP Inheritance)
 * Menangani sinkronisasi real-time data dari backend Laravel ke Supabase Cloud (Auth & Tables).
 */
class SupabaseSyncService extends BaseService
{
    protected static function getClient()
    {
        $url = rtrim(config('supabase.url'), '/');
        $key = config('supabase.anon_key');

        return [
            'url' => $url,
            'headers' => [
                'apikey' => $key,
                'Authorization' => 'Bearer ' . $key,
                'Content-Type' => 'application/json',
                'Prefer' => 'return=representation',
            ]
        ];
    }

    /**
     * Sinkronisasi registrasi user ke Supabase Auth & tabel profiles
     */
    public static function syncUserSignup(string $email, string $password, string $name, string $role = 'customer'): ?string
    {
        try {
            $client = self::getClient();

            // 1. Sign up ke Supabase Auth API
            $response = Http::withHeaders($client['headers'])->post("{$client['url']}/auth/v1/signup", [
                'email' => $email,
                'password' => $password,
                'data' => [
                    'full_name' => $name,
                    'role' => $role,
                ],
            ]);

            $data = $response->json();
            $supabaseUid = $data['user']['id'] ?? null;

            if ($supabaseUid) {
                // 2. Upsert ke tabel profiles di Supabase
                Http::withHeaders($client['headers'])->post("{$client['url']}/rest/v1/profiles", [
                    'id' => $supabaseUid,
                    'full_name' => $name,
                    'role' => $role,
                ]);
            }

            return $supabaseUid;
        } catch (\Throwable $e) {
            Log::warning("Supabase user sync failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Sinkronisasi produk ke Supabase tabel products
     */
    public static function syncProduct(Product $product, string $action = 'upsert'): void
    {
        try {
            $client = self::getClient();

            if ($action === 'delete') {
                Http::withHeaders($client['headers'])
                    ->delete("{$client['url']}/rest/v1/products?name=eq.{$product->name}");
                return;
            }

            Http::withHeaders(array_merge($client['headers'], ['Prefer' => 'resolution=merge-duplicates']))
                ->post("{$client['url']}/rest/v1/products", [
                    'name' => $product->name,
                    'price' => (int) $product->price,
                    'stock' => (int) $product->stock,
                    'image_url' => $product->image_url,
                    'description' => $product->description,
                    'is_featured' => (bool) $product->is_featured,
                ]);
        } catch (\Throwable $e) {
            Log::warning("Supabase product sync failed: " . $e->getMessage());
        }
    }

    /**
     * Sinkronisasi review ke Supabase tabel reviews
     */
    public static function syncReview(Review $review): void
    {
        try {
            $client = self::getClient();

            Http::withHeaders($client['headers'])->post("{$client['url']}/rest/v1/reviews", [
                'rating' => (int) $review->rating,
                'comment' => $review->comment,
            ]);
        } catch (\Throwable $e) {
            Log::warning("Supabase review sync failed: " . $e->getMessage());
        }
    }

    /**
     * Sinkronisasi order ke Supabase tabel orders
     */
    public static function syncOrder(Order $order): void
    {
        try {
            $client = self::getClient();

            Http::withHeaders($client['headers'])->post("{$client['url']}/rest/v1/orders", [
                'order_code' => $order->order_code,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'customer_address' => $order->customer_address,
                'payment_method' => $order->payment_method,
                'total' => (int) $order->total,
                'status' => $order->status,
            ]);
        } catch (\Throwable $e) {
            Log::warning("Supabase order sync failed: " . $e->getMessage());
        }
    }

    /**
     * Upload file ke Supabase Storage via REST API
     */
    public static function uploadStorageFile(\Illuminate\Http\UploadedFile $file, string $folder = 'products'): string
    {
        $url = rtrim(config('supabase.url'), '/');
        $key = config('supabase.anon_key');

        $bucket = ($folder === 'avatars') ? 'avatars' : 'product-images';
        $extension = $file->getClientOriginalExtension() ?: 'png';
        $fileName = time() . '-' . uniqid() . '.' . $extension;

        try {
            $response = Http::withHeaders([
                'apikey' => $key,
                'Authorization' => 'Bearer ' . $key,
                'Content-Type' => $file->getMimeType() ?: 'image/jpeg',
                'x-upsert' => 'true',
            ])->withBody(file_get_contents($file->getRealPath()), $file->getMimeType() ?: 'image/jpeg')
              ->post("{$url}/storage/v1/object/{$bucket}/{$fileName}");

            if ($response->successful()) {
                return "{$url}/storage/v1/object/public/{$bucket}/{$fileName}";
            }

            Log::warning("Supabase Storage upload failed ({$response->status()}): " . $response->body());
        } catch (\Throwable $e) {
            Log::warning("Supabase Storage upload exception: " . $e->getMessage());
        }

        // Fallback jika bucket tidak ditemukan / ada isu koneksi
        $path = $file->store($folder, 'public');
        return '/storage/' . $path;
    }
}
