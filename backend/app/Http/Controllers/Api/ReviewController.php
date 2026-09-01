<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    protected ReviewService $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * GET /api/products/{productId}/reviews
     */
    public function index(int $productId): JsonResponse
    {
        $reviews = $this->reviewService->listByProduct($productId);
        return response()->json($reviews);
    }

    /**
     * POST /api/products/{productId}/reviews
     */
    public function store(Request $request, int $productId): JsonResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = $this->reviewService->create(
            $request->user()->id,
            $productId,
            $validated['rating'],
            $validated['comment'] ?? null
        );

        return response()->json($review, 201);
    }
}
