# Wijaya Living & Elektronik

E-commerce Next.js + Supabase. Proyek Pra-UKK PPLG 2026.

## ⚠️ WAJIB: Setup ulang database (kalau sebelumnya udah pernah run schema versi lama)

Schema berubah total (nambah sistem akun customer). Jalankan ulang dari nol:

### 1. Install dependencies
```bash
npm install
```

### 2. Setup Supabase
1. Buka **SQL Editor** di dashboard Supabase, copy-paste **seluruh isi** `supabase-schema.sql`, klik Run
   (script ini otomatis hapus tabel lama dan bikin ulang, aman dijalankan walau sebelumnya udah pernah setup)
2. Buat akun admin:
   - **Authentication > Users > Add User** → misal `admin@wijayaliving.id`, password bebas (min 6 karakter)
   - Balik ke **SQL Editor**, jalankan:
     ```sql
     update profiles set role = 'admin'
     where id = (select id from auth.users where email = 'admin@wijayaliving.id');
     ```
3. Cek **Storage** di sidebar — harusnya udah otomatis ada bucket `product-images` (dibuat dari schema)
4. Buka **Project Settings > API**, copy `Project URL` dan `anon public key`

### 3. Environment variables
```bash
cp .env.local.example .env.local
```
Isi dengan URL & anon key dari langkah 2.

### 4. Jalankan
```bash
npm run dev
```

## Alur aplikasi
- **Customer**: buka `/` bebas lihat-lihat produk tanpa login. Begitu klik "Add to Cart", "Cart", atau "Checkout" tanpa login → diarahkan ke `/login` (bisa daftar dulu di `/register`)
- **Admin**: login di `/login` pakai akun admin → otomatis diarahkan ke `/admin/products`. Customer biasa gak bisa akses `/admin/*` (bakal ditolak balik ke `/`)

## Halaman
- `/` — Shop (bebas diakses)
- `/register` — Daftar akun customer baru
- `/login` — Login (dipakai admin & customer, redirect otomatis sesuai role)
- `/cart` — Keranjang (butuh login)
- `/checkout` — Form checkout (butuh login)
- `/admin/products` — Kelola produk (khusus admin)
- `/admin/products/new` — Tambah produk + upload gambar asli
- `/admin/products/[id]` — Edit produk

## Yang sudah selesai
- ✅ Sistem akun: register/login customer + login admin (role-based, 1 tabel `profiles`)
- ✅ CRUD produk penuh, termasuk **upload gambar asli** ke Supabase Storage (bukan cuma URL)
- ✅ Cart & Checkout terhubung ke akun (bukan localStorage lagi)
- ✅ Proteksi halaman via middleware (role admin utk `/admin`, wajib login utk `/cart` & `/checkout`)
- ✅ RLS lengkap — customer cuma bisa lihat cart/order miliknya sendiri, admin bisa lihat semua

## Kalau ada error TypeScript soal cookies/CookieOptions
Sudah dibenerin di versi ini (tipe eksplisit di `middleware.ts` & `lib/supabase-server.ts`). Kalau muncul lagi, hapus folder `.next` lalu `npm run dev` ulang.
