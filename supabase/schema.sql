-- Titipin — Jastip Platform schema (PostgreSQL / Supabase)
-- Run this in the Supabase SQL Editor to create all 9 tables.

create extension if not exists "uuid-ossp";

-- 1. users
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text unique not null,
  whatsapp_number text unique,
  shipping_address text,
  store_credit_balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

-- 2. trips
create table if not exists trips (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  destination_country text not null,
  system_exchange_rate numeric(12,4) not null,
  status text not null default 'Planning'
    check (status in ('Planning','Active Shopping','In Transit to ID','Completed'))
);

-- 3. catalog_products
create table if not exists catalog_products (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete set null,
  name text not null,
  description text,
  base_price_foreign numeric(14,2) not null default 0,
  markup_percentage numeric(6,2) not null default 20,
  flat_jastip_fee numeric(14,2) not null default 0,
  final_price_idr numeric(14,2) not null default 0,
  image_url text,
  is_active boolean not null default true,
  category text,
  store_location text
);

-- 4. custom_requests
create table if not exists custom_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  product_name_or_desc text not null,
  product_url text,
  uploaded_image_urls text[],
  quantity int not null default 1,
  variations text,
  status text not null default 'Pending Review'
    check (status in ('Pending Review','Quote Sent','Accepted','Rejected')),
  quoted_price_idr numeric(14,2),
  required_dp_idr numeric(14,2),
  created_at timestamptz not null default now()
);

-- 5. orders
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  trip_id uuid references trips(id) on delete set null,
  total_price_idr numeric(14,2) not null default 0,
  total_dp_required_idr numeric(14,2) not null default 0,
  local_shipping_fee_idr numeric(14,2),
  status text not null default 'Waiting DP'
    check (status in ('Waiting DP','DP Paid','Purchased Overseas','Shipped to ID','Awaiting Final Payment','Completed','Cancelled')),
  created_at timestamptz not null default now()
);

-- 6. order_items
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references catalog_products(id) on delete set null,
  request_id uuid references custom_requests(id) on delete set null,
  item_name text not null,
  quantity int not null default 1,
  locked_price_idr numeric(14,2) not null default 0,
  store_location text,
  item_status text not null default 'Pending Purchase'
    check (item_status in ('Pending Purchase','Secured','Out of Stock')),
  admin_receipt_url text
);

-- 7. add_ons
create table if not exists add_ons (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price_idr numeric(14,2) not null default 0
);

-- 8. order_add_ons (junction)
create table if not exists order_add_ons (
  order_id uuid references orders(id) on delete cascade,
  addon_id uuid references add_ons(id) on delete cascade,
  primary key (order_id, addon_id)
);

-- 9. payments
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  payment_type text not null check (payment_type in ('Down Payment','Final Payment')),
  amount_idr numeric(14,2) not null,
  payment_method text,
  receipt_image_url text,
  status text not null default 'Pending Verification'
    check (status in ('Pending Verification','Verified','Failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_products_trip on catalog_products(trip_id);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_items_order on order_items(order_id);
create index if not exists idx_requests_user on custom_requests(user_id);

-- Storage buckets to create in the Supabase dashboard:
--   product_images (Public), receipts (Private), request_uploads (Private)
