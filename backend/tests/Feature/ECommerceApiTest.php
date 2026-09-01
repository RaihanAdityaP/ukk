<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ECommerceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_products(): void
    {
        $category = Category::create(['name' => 'Elektronik']);
        Product::create([
            'name' => 'Laptop Gaming',
            'category_id' => $category->id,
            'price' => 15000000,
            'stock' => 5,
        ]);

        $response = $this->getJson('/api/products');
        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    public function test_customer_can_register_and_login(): void
    {
        $regResponse = $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@test.com',
            'password' => 'password123',
            'phone' => '0812345678',
            'address' => 'Jl. Mawar No 1',
        ]);

        $regResponse->assertStatus(201)
                    ->assertJsonStructure(['user', 'token']);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'budi@test.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200)
                      ->assertJsonStructure(['user', 'token']);
    }

    public function test_cart_and_checkout_flow_with_stock_deduction(): void
    {
        $user = User::create([
            'name' => 'Customer Test',
            'email' => 'customer@test.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $product = Product::create([
            'name' => 'Meja Kerja Minimalis',
            'price' => 500000,
            'stock' => 10,
        ]);

        // 1. Add to cart
        $cartResponse = $this->actingAs($user)
                             ->postJson('/api/cart', [
                                 'product_id' => $product->id,
                                 'quantity' => 2,
                             ]);
        $cartResponse->assertStatus(201);

        // 2. Checkout
        $checkoutResponse = $this->actingAs($user)
                                 ->postJson('/api/orders/checkout', [
                                     'customer_name' => 'Customer Test',
                                     'customer_phone' => '08123456789',
                                     'customer_address' => 'Jl. Melati No. 20',
                                     'payment_method' => 'cod',
                                 ]);

        $checkoutResponse->assertStatus(201)
                         ->assertJsonStructure(['id', 'order_code', 'order']);

        // 3. Verify stock was decremented from 10 to 8
        $this->assertEquals(8, $product->fresh()->stock);

        // 4. Verify cart was cleared
        $getCart = $this->actingAs($user)->getJson('/api/cart');
        $getCart->assertStatus(200)->assertJsonCount(0);
    }

    public function test_non_admin_cannot_create_product(): void
    {
        $user = User::create([
            'name' => 'Normal User',
            'email' => 'user@test.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $response = $this->actingAs($user)->postJson('/api/products', [
            'name' => 'Produk Ilegal',
            'price' => 100000,
            'stock' => 1,
        ]);

        $response->assertStatus(403);
    }
}
