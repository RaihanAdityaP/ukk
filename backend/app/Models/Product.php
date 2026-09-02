<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'stock',
        'image_url',
        'is_featured',
    ];

    protected $casts = [
        'price' => 'integer',
        'stock' => 'integer',
        'is_featured' => 'boolean',
    ];

    protected $appends = [
        'average_rating',
        'total_sold',
        'total_orders',
        'total_reviews',
        'popularity_score',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function categories()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class)->latest();
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getAverageRatingAttribute(): float
    {
        if (array_key_exists('reviews_avg_rating', $this->attributes) && $this->attributes['reviews_avg_rating'] !== null) {
            return round((float) $this->attributes['reviews_avg_rating'], 1);
        }

        return round((float) ($this->reviews()->avg('rating') ?? 0), 1);
    }

    public function getTotalSoldAttribute(): int
    {
        if (array_key_exists('total_sold', $this->attributes) && $this->attributes['total_sold'] !== null) {
            return (int) $this->attributes['total_sold'];
        }

        return (int) $this->orderItems()
            ->whereHas('order', function ($q) {
                $q->whereIn('status', ['paid', 'shipped', 'done']);
            })
            ->sum('quantity');
    }

    public function getTotalOrdersAttribute(): int
    {
        if (array_key_exists('total_orders', $this->attributes) && $this->attributes['total_orders'] !== null) {
            return (int) $this->attributes['total_orders'];
        }

        return (int) $this->orderItems()
            ->whereHas('order', function ($q) {
                $q->whereIn('status', ['paid', 'shipped', 'done']);
            })
            ->count();
    }

    public function getTotalReviewsAttribute(): int
    {
        if (array_key_exists('reviews_count', $this->attributes) && $this->attributes['reviews_count'] !== null) {
            return (int) $this->attributes['reviews_count'];
        }

        return (int) $this->reviews()->count();
    }

    /**
     * Hitung Skor Popularitas secara objektif berdasarkan akumulasi data riil:
     * - Total Unit Terjual dari Pesanan Valid (Bobot 45%)
     * - Kualitas Rating Ulasan Pembeli (Bobot 35%)
     * - Jumlah Ulasan / Social Proof (Bobot 15%)
     * - Frekuensi Transaksi Pesanan (Bobot 5%)
     */
    public function getPopularityScoreAttribute(): float
    {
        $totalSold = $this->total_sold;
        $avgRating = $this->average_rating;
        $totalReviews = $this->total_reviews;
        $totalOrders = $this->total_orders;

        $salesFactor = min($totalSold * 12, 100);
        $ratingFactor = $avgRating > 0 ? ($avgRating / 5.0) * 100 : 0;
        $reviewFactor = min($totalReviews * 15, 100);
        $orderFactor = min($totalOrders * 10, 100);

        $score = ($salesFactor * 0.45) + ($ratingFactor * 0.35) + ($reviewFactor * 0.15) + ($orderFactor * 0.05);

        return round($score, 2);
    }
}
