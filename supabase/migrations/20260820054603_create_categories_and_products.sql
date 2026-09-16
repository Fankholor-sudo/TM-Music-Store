/*
# Create categories and products tables for TM Music store

1. New Tables
- `categories`: product groupings (In-Ear Monitors, Audio Cables, etc.)
  - id (uuid, primary key)
  - name (text, not null, unique)
  - slug (text, not null, unique)
  - description (text)
  - image_url (text)
  - display_order (int, default 0)
  - created_at (timestamptz)
- `products`: catalogue items
  - id (uuid, primary key)
  - name (text, not null)
  - slug (text, not null, unique)
  - brand (text, not null)
  - category_id (uuid, foreign key -> categories.id)
  - description (text, not null)
  - price (numeric(10,2), not null)
  - image_url (text, not null)
  - additional_images (text[], default '{}')
  - specifications (jsonb, default '{}')
  - availability (text, not null, default 'In Stock') -- 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Pre-Order'
  - featured (boolean, default false)
  - created_at (timestamptz, default now())

2. Indexes
- products.slug (unique)
- products.category_id
- products.featured
- categories.slug (unique)

3. Security
- RLS enabled on both tables.
- Public read-only access for anon + authenticated (catalogue is intentionally public).
- No insert/update/delete policies — data is managed via the Supabase dashboard / service role.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  brand text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  image_url text NOT NULL,
  additional_images text[] NOT NULL DEFAULT '{}',
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  availability text NOT NULL DEFAULT 'In Stock',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories"
  ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products"
  ON products FOR SELECT
  TO anon, authenticated USING (true);
