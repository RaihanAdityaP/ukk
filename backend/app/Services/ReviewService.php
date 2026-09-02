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

    public function delete(int $userId, int $reviewId, bool $isAdmin = false): void
    {
        $query = Review::where('id', $reviewId);
        if (!$isAdmin) {
            $query->where('user_id', $userId);
        }
        $review = $query->firstOrFail();

        $authorId = $review->user_id;
        $productId = $review->product_id;
        $commentSnippet = mb_substr($review->comment ?? "Rating {$review->rating}★", 0, 40);

        $review->delete();

        ActivityLogService::record(
            $userId,
            'DELETE_REVIEW',
            $isAdmin && $userId !== $authorId
                ? "Admin menghapus ulasan pengguna pada produk ID #{$productId} ('{$commentSnippet}')"
                : "Pengguna menghapus ulasannya sendiri pada produk ID #{$productId}",
            ['review_id' => $reviewId, 'product_id' => $productId, 'author_id' => $authorId]
        );
    }
}
