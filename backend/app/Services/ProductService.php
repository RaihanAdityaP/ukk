<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

/**
 * Class ProductService
 * Mewarisi BaseService (Inheritance)
 * Menangani semua business logic produk, gambar, filter & featured product.
 */
class ProductService extends BaseService
{
    /**
     * Ambil daftar produk dengan filter search dan kategori.
     */
    public function list(?string $search = null, ?string $categoryId = null)
    {
        $query = Product::with(['category', 'reviews.user'])
            ->withAvg('reviews', 'rating')
            ->latest();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($categoryId && $categoryId !== 'All') {
            $query->where('category_id', $categoryId);
        }

        return $query->get();
    }

    /**
     * Ambil detail satu produk berdasarkan ID.
     */
    public function getById(int $id): Product
    {
        return Product::with(['category', 'reviews.user'])
            ->withAvg('reviews', 'rating')
            ->findOrFail($id);
    }

    /**
     * Tambah produk baru (Admin).
     */
    public function create(array $data, ?UploadedFile $image = null): Product
    {
        return $this->transaction(function () use ($data, $image) {
            if ($image) {
                $path = $image->store('products', 'public');
                $data['image_url'] = '/storage/' . $path;
            }

            // Jika is_featured diset true, reset produk featured sebelumnya
            if (!empty($data['is_featured'])) {
                Product::where('is_featured', true)->update(['is_featured' => false]);
            }

            $product = Product::create($data);

            // Sync ke Supabase Database
            SupabaseSyncService::syncProduct($product, 'upsert');

            ActivityLogService::record(
                auth()->id(),
                'CREATE_PRODUCT',
                "Menambahkan produk baru '{$product->name}' (Rp " . number_format($product->price, 0, ',', '.') . ")",
                ['product_id' => $product->id, 'name' => $product->name, 'price' => $product->price]
            );

            return $product;
        });
    }

    /**
     * Update data produk (Admin).
     */
    public function update(int $id, array $data, ?UploadedFile $image = null): Product
    {
        $product = Product::findOrFail($id);

        return $this->transaction(function () use ($product, $data, $image) {
            if ($image) {
                // Hapus gambar lama jika ada di local public storage
                if ($product->image_url && str_starts_with($product->image_url, '/storage/')) {
                    $oldPath = str_replace('/storage/', '', $product->image_url);
                    Storage::disk('public')->delete($oldPath);
                }

                $path = $image->store('products', 'public');
                $data['image_url'] = '/storage/' . $path;
            }

            if (!empty($data['is_featured'])) {
                Product::where('id', '!=', $product->id)
                    ->where('is_featured', true)
                    ->update(['is_featured' => false]);
            }

            $product->update($data);

            // Sync ke Supabase Database
            SupabaseSyncService::syncProduct($product, 'upsert');

            ActivityLogService::record(
                auth()->id(),
                'UPDATE_PRODUCT',
                "Memperbarui produk '{$product->name}' (ID: {$product->id})",
                ['product_id' => $product->id, 'changes' => array_keys($data)]
            );

            return $product->fresh(['category', 'reviews.user']);
        });
    }

    /**
     * Hapus produk (Admin).
     */
    public function delete(int $id): void
    {
        $product = Product::findOrFail($id);
        $name = $product->name;

        if ($product->image_url && str_starts_with($product->image_url, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $product->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        // Sync ke Supabase Database
        SupabaseSyncService::syncProduct($product, 'delete');

        $product->delete();

        ActivityLogService::record(
            auth()->id(),
            'DELETE_PRODUCT',
            "Menghapus produk '{$name}' (ID: {$id})",
            ['product_id' => $id, 'name' => $name]
        );
    }
}
