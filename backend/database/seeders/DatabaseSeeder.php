<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@wijayaliving.id'],
            [
                'name' => 'Admin Wijaya Living',
                'password' => Hash::make('WheniAdmin1'),
                'role' => 'admin',
                'phone' => '081234567890',
                'address' => 'Kantor Pusat Wijaya Living, Jakarta',
            ]
        );

        // 2. Seed Customer User
        $customer = User::firstOrCreate(
            ['email' => 'customer@wijaya.id'],
            [
                'name' => 'Customer Wijaya',
                'password' => Hash::make('WheniCustomer1'),
                'role' => 'customer',
                'phone' => '089876543210',
                'address' => 'Jl. Merdeka No. 45, Bandung',
            ]
        );

        // 3. Seed Supabase Categories
        $categoriesMap = [
            '891fd70b-d6cb-437e-a154-a0dba25f9598' => 'Electronics',
            '01d32233-cc75-4275-a8ed-46523846b52a' => 'Accessories',
            '62c1ccf6-2672-4627-ac0c-4439a2c8d5d8' => 'Clothing',
            'c7a8c64e-7664-48e7-92ce-05cdf0da4704' => 'Home',
        ];

        $createdCategories = [];
        foreach ($categoriesMap as $oldId => $name) {
            $cat = Category::firstOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)]
            );
            $createdCategories[$oldId] = $cat->id;
        }

        // 4. Seed Supabase Real Products
        $products = [
            [
                'name' => 'Smart LED TV 43 inch',
                'price' => 3299000,
                'stock' => 5,
                'category_id' => $createdCategories['891fd70b-d6cb-437e-a154-a0dba25f9598'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/a4e5ece4-4495-481e-b58e-0c23c024d3c7.jpg',
                'description' => 'Smart TV LED 43 inch dengan gambar tajam dan akses ke berbagai aplikasi streaming. Pilihan tepat untuk ruang keluarga maupun kamar tidur.',
                'is_featured' => true,
            ],
            [
                'name' => 'Canvas Backpack',
                'price' => 159000,
                'stock' => 40,
                'category_id' => $createdCategories['01d32233-cc75-4275-a8ed-46523846b52a'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/d12831fc-5fda-421c-8642-2c569b3b8a3d.jpg',
                'description' => 'Tas ransel berbahan kanvas tebal, tahan lama dan cukup luas untuk kebutuhan sekolah, kuliah, maupun kerja sehari-hari.',
                'is_featured' => false,
            ],
            [
                'name' => 'Cotton Bedsheet Set (Queen)',
                'price' => 245000,
                'stock' => 20,
                'category_id' => $createdCategories['c7a8c64e-7664-48e7-92ce-05cdf0da4704'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/8b619167-700a-488f-9b6b-60a06d16af16.jfif',
                'description' => 'Set sprei katun ukuran queen, lembut di kulit dan nyaman digunakan sepanjang malam. Mudah dirawat dan tahan lama.',
                'is_featured' => false,
            ],
            [
                'name' => 'Electric Kettle Stainless',
                'price' => 145000,
                'stock' => 25,
                'category_id' => $createdCategories['891fd70b-d6cb-437e-a154-a0dba25f9598'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/1a30feeb-160b-46f3-942d-48fcbabcad55.jfif',
                'description' => 'Ketel listrik berbahan stainless steel, mendidihkan air lebih cepat dan hemat energi. Cocok untuk kebutuhan minum teh atau kopi setiap hari.',
                'is_featured' => false,
            ],
            [
                'name' => 'Rice Cooker 1.8L',
                'price' => 275000,
                'stock' => 18,
                'category_id' => $createdCategories['891fd70b-d6cb-437e-a154-a0dba25f9598'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/7ef0774e-a87a-42f5-a8db-b7b0c7aa3768.jfif',
                'description' => 'Rice cooker kapasitas 1.8 liter, cukup untuk kebutuhan keluarga kecil hingga menengah. Praktis digunakan sehari-hari dengan hasil nasi yang pulen.',
                'is_featured' => false,
            ],
            [
                'name' => 'Portable Bluetooth Speaker',
                'price' => 189000,
                'stock' => 21,
                'category_id' => $createdCategories['891fd70b-d6cb-437e-a154-a0dba25f9598'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/3b441338-830c-4551-ae8c-91c8c34ac039.jfif',
                'description' => 'Speaker Bluetooth portable dengan suara jernih dan baterai tahan lama. Praktis dibawa untuk acara kumpul keluarga atau sekadar menemani aktivitas harian.',
                'is_featured' => false,
            ],
            [
                'name' => 'Wooden Wall Clock',
                'price' => 210000,
                'stock' => 12,
                'category_id' => $createdCategories['c7a8c64e-7664-48e7-92ce-05cdf0da4704'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/821f287f-5681-4989-9b59-5d84c8d202f4.jfif',
                'description' => 'Jam dinding kayu dengan desain simpel dan hangat, mempercantik ruang tamu atau ruang kerja sekaligus penunjuk waktu yang jelas dari jarak jauh.',
                'is_featured' => false,
            ],
            [
                'name' => 'Bamboo Desk Organizer',
                'price' => 129000,
                'stock' => 32,
                'category_id' => $createdCategories['c7a8c64e-7664-48e7-92ce-05cdf0da4704'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/c8bc7d42-ffc8-4137-ae10-1c0b2fb9b4fb.jfif',
                'description' => 'Organizer meja berbahan bambu alami, cocok untuk merapikan alat tulis, gadget, dan perlengkapan kerja di meja belajar atau kantor.',
                'is_featured' => false,
            ],
            [
                'name' => 'Minimalist Leather Wallet',
                'price' => 89000,
                'stock' => 5,
                'category_id' => $createdCategories['01d32233-cc75-4275-a8ed-46523846b52a'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/693e1a26-ee96-40ea-a66e-f1f2f0f8a5c2.jfif',
                'description' => 'Dompet kulit dengan desain minimalis dan slot kartu yang cukup untuk kebutuhan harian. Ringkas dan mudah dibawa di saku atau tas kecil.',
                'is_featured' => false,
            ],
            [
                'name' => 'Wireless Noise-Cancelling Headphones',
                'price' => 249000,
                'stock' => 14,
                'category_id' => $createdCategories['891fd70b-d6cb-437e-a154-a0dba25f9598'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/10c3785d-1405-44db-8e41-b137cd35a404.jfif',
                'description' => 'Headphone wireless dengan fitur noise-cancelling untuk pengalaman mendengarkan yang lebih jernih tanpa gangguan suara sekitar. Nyaman dipakai untuk kerja, belajar, atau perjalanan jauh.',
                'is_featured' => false,
            ],
            [
                'name' => 'Stainless Steel Water Bottle',
                'price' => 65000,
                'stock' => 54,
                'category_id' => $createdCategories['01d32233-cc75-4275-a8ed-46523846b52a'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/d449afd6-9148-459f-99d8-b5cdd5263200.jfif',
                'description' => 'Botol minum stainless steel yang menjaga suhu air lebih lama, aman digunakan berulang kali dan ramah lingkungan.',
                'is_featured' => false,
            ],
            [
                'name' => 'Rattan Storage Basket',
                'price' => 98000,
                'stock' => 30,
                'category_id' => $createdCategories['c7a8c64e-7664-48e7-92ce-05cdf0da4704'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/6d6293d0-4c1e-4779-8c9d-f7cf8b63744b.jpg',
                'description' => 'Keranjang penyimpanan berbahan rotan alami, cocok untuk merapikan pakaian, mainan, atau perlengkapan rumah tangga lainnya.',
                'is_featured' => false,
            ],
            [
                'name' => 'Denim Jacket Unisex',
                'price' => 289000,
                'stock' => 15,
                'category_id' => $createdCategories['62c1ccf6-2672-4627-ac0c-4439a2c8d5d8'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/b18535db-6ed6-483d-b9b4-d2553e83561b.jfif',
                'description' => 'Jaket denim unisex dengan potongan simpel yang cocok dipadukan dengan berbagai outfit, cocok untuk cuaca sejuk maupun gaya kasual sehari-hari.',
                'is_featured' => false,
            ],
            [
                'name' => 'Cotton Socks (3 Pairs)',
                'price' => 45000,
                'stock' => 47,
                'category_id' => $createdCategories['62c1ccf6-2672-4627-ac0c-4439a2c8d5d8'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/faa52f3e-2395-499e-b2bb-f1d6c987cb48.jpg',
                'description' => 'Kaos kaki katun isi 3 pasang, nyaman dipakai seharian dan bahan menyerap keringat dengan baik.',
                'is_featured' => false,
            ],
            [
                'name' => 'Basic Cotton T-Shirt',
                'price' => 79000,
                'stock' => 0,
                'category_id' => $createdCategories['62c1ccf6-2672-4627-ac0c-4439a2c8d5d8'],
                'image_url' => 'https://wdgbgjdepnjnwswsyigq.supabase.co/storage/v1/object/public/product-images/7bc79eac-5c26-4c2d-9557-a8b53d28a123.jpg',
                'description' => 'Kaos katun dasar dengan bahan adem dan nyaman dipakai sehari-hari, cocok untuk berbagai gaya berpakaian.',
                'is_featured' => false,
            ],
        ];

        foreach ($products as $p) {
            Product::create($p);
        }
    }
}
