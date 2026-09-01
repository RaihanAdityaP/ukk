# Wijaya Living & Elektronik

Toko online perabot rumah tangga dan alat elektronik berbasis **Next.js 15** + **Laravel 12 REST API (OOP)**.

---

## 📖 Tentang

**Wijaya Living & Elektronik** adalah aplikasi e-commerce modern yang memisahkan antarmuka pengguna (*Frontend Next.js*) dan pemrosesan data (*Backend Laravel REST API*). Mengimplementasikan konsep *Object-Oriented Programming* (OOP) yang terstruktur di sisi backend dan performa antarmuka yang cepat dan responsif.

---

## ✨ Fitur-Fitur

### 🛍️ Customer
* **Katalog Produk**: Tampilan produk lengkap, banner produk unggulan (*featured*), info harga, stok, dan rating.
* **Pencarian & Filter**: Pencarian instan berdasarkan nama dan filter kategori.
* **Review & Rating**: Ulasan dan penilaian bintang (1–5) dari pembeli.
* **Keranjang Belanja**: Modal pemilihan jumlah (*quantity*), pengecekan batas stok otomatis, dan kalkulasi subtotal.
* **Checkout & Pembayaran**:
  * Bayar di Tempat (COD)
  * Bayar Online via **Midtrans Snap** (Transfer Bank, QRIS, E-Wallet, Kartu Kredit)
* **Profil Pengguna**: Pengelolaan data penerima, alamat pengiriman, nomor telepon, dan upload foto profil.

### 🛡️ Admin
* **Kelola Produk (CRUD)**: Tambah, edit deskripsi/harga/stok, tandai produk unggulan, dan hapus produk.
* **Upload Gambar**: Upload file foto produk langsung ke storage lokal server.
* **Log Aktivitas Sistem**: Pencatatan riwayat audit otomatis (waktu, jenis aksi, user/admin pelaksana, detail perubahan, dan alamat IP).

---

## 💻 Tech Stack

* **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons
* **Backend**: Laravel 12, PHP 8.4, Laravel Sanctum, Midtrans PHP SDK
* **Database**: SQLite / MySQL

---

## 🚀 Cara Menjalankan

### 1. Terminal Backend (Laravel)
```bash
cd backend
php artisan serve
```
> Berjalan di: `http://localhost:8000`

### 2. Terminal Frontend (Next.js)
```bash
cd frontend
npm run dev
```
> Berjalan di: `http://localhost:3000`

---

## 🔑 Akun Demo

* **Admin**: `admin@wijayaliving.id` / `WheniAdmin1`
* **Customer**: `customer@wijaya.id` / `WheniCustomer1`