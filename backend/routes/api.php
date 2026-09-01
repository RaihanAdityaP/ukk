<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Public Routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);

// Midtrans Webhook (Public)
Route::post('/payment/notification', [PaymentController::class, 'notification']);

// --- Protected Routes (Authenticated via Sanctum Token) ---
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Orders & Checkout
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{code}', [OrderController::class, 'show']);
    Route::post('/orders/checkout', [OrderController::class, 'checkout']);

    // Midtrans Payment Snap
    Route::post('/payment/create-transaction', [PaymentController::class, 'createSnapToken']);

    // Reviews
    Route::post('/products/{productId}/reviews', [ReviewController::class, 'store']);

    // --- Admin Only Routes ---
    Route::middleware('admin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::post('/products/{id}', [ProductController::class, 'update']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        Route::post('/categories', [CategoryController::class, 'store']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        Route::post('/upload', [\App\Http\Controllers\Api\UploadController::class, 'upload']);

        Route::get('/admin/logs', [\App\Http\Controllers\Api\ActivityLogController::class, 'index']);

        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    });
});
