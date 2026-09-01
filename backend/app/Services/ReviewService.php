<?php

namespace App\Services;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Validation\ValidationException;

/**
 * Class ReviewService
 * Mewarisi BaseService (Inheritance)
 */
class ReviewService extends BaseService
{
    public function listByProduct(int $productId)
    {
        return Review::with('user')
            ->where('product_id', $productId)
            ->latest()
            ->get();
    }

    public function create(int $userId, int $productId, int $rating, ?string $comment = null): Review
    {
        if ($rating < 1 || $rating > 5) {
            throw ValidationException::withMessages(['rating' => 'Rating harus antara 1 sampai 5.']);
        }

        Product::findOrFail($productId);

        $review = Review::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'rating' => $rating,
            'comment' => $comment,
        ])->load('user');

        SupabaseSyncService::syncReview($review);

        return $review;
    }
}
