-- ============================================
-- WIJAYA LIVING & ELEKTRONIK — SCHEMA v2
-- Tambahan: akun customer (login wajib buat cart/checkout), role admin/customer
-- Jalankan SEMUA ini di Supabase SQL Editor (aman dijalankan ulang dari awal)
-- ============================================

drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists cart_items cascade;
drop table if exists products cascade;
drop table if exists categories cascade;
drop table if exists profiles cascade;

-- ============================================
-- PROFILES — extend auth.users bawaan Supabase dengan role
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer',  -- 'customer' | 'admin'
  created_at timestamptz default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- CATEGORIES & PRODUCTS
-- ============================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

insert into categories (name) values
  ('Electronics'), ('Accessories'), ('Clothing'), ('Home');

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null,
  stock integer not null default 0,
  category_id uuid references categories(id),
  image_url text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- CART — terikat ke user_id (bukan session_id lagi), karena wajib login
-- ============================================
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

-- ============================================
-- ORDERS
-- ============================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  customer_id uuid references auth.users(id),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  payment_method text not null,
  total integer not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  price integer not null,
  quantity integer not null
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table profiles enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "read own profile" on profiles for select using (auth.uid() = id);

create policy "public read products" on products for select using (true);
create policy "public read categories" on categories for select using (true);

create policy "admin write products" on products for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "own cart access" on cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "customer insert own order" on orders for insert with check (auth.uid() = customer_id);
create policy "customer read own order" on orders for select using (auth.uid() = customer_id);
create policy "admin read all orders" on orders for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "admin update orders" on orders for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "insert own order items" on order_items for insert with check (true);
create policy "read own order items" on order_items for select
  using (exists (select 1 from orders where orders.id = order_items.order_id and
    (orders.customer_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))));

-- ============================================
-- STORAGE — bucket buat upload gambar produk
-- ============================================
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

create policy "public read product images" on storage.objects for select
  using (bucket_id = 'product-images');

create policy "admin upload product images" on storage.objects for insert
  with check (bucket_id = 'product-images' and exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "admin delete product images" on storage.objects for delete
  using (bucket_id = 'product-images' and exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- SAMPLE DATA
-- ============================================
insert into products (name, price, stock, category_id, image_url) values
  ('Wireless Noise-Cancelling Headphones', 249000, 14, (select id from categories where name='Electronics'), ''),
  ('Minimalist Leather Wallet', 89000, 32, (select id from categories where name='Accessories'), ''),
  ('Bamboo Desk Organizer', 129000, 0, (select id from categories where name='Home'), '');

-- ============================================
-- CARA BIKIN AKUN ADMIN (WAJIB, manual setelah run script ini):
-- 1. Authentication > Users > Add User → buat akun (misal admin@wijayaliving.id)
-- 2. Di SQL Editor, jalankan (ganti email sesuai yang kamu buat):
--
--    update profiles set role = 'admin'
--    where id = (select id from auth.users where email = 'admin@wijayaliving.id');
--
-- Akun yang daftar lewat /register otomatis jadi role 'customer'.
-- ============================================
