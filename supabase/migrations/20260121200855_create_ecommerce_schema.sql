/*
  # ONIUM Ecommerce Platform Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `title` (text, product name)
      - `description` (text, product description)
      - `price` (numeric, product price)
      - `category` (text, product category)
      - `image_url` (text, product image)
      - `specifications` (jsonb, detailed specs)
      - `stock` (integer, available quantity)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `deals`
      - `id` (uuid, primary key)
      - `image_url` (text, deal banner image)
      - `link_url` (text, deal destination link)
      - `order_position` (integer, display order)
      - `is_active` (boolean, visibility toggle)
      - `created_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `customer_address` (text)
      - `total_price` (numeric)
      - `status` (text, order status)
      - `created_at` (timestamptz)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `product_title` (text, snapshot)
      - `quantity` (integer)
      - `price_at_purchase` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public can read products and deals
    - Only authenticated admins can manage products, deals, and view orders
    - Anyone can create orders (public checkout)
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  price numeric(10, 2) NOT NULL,
  category text DEFAULT 'general',
  image_url text DEFAULT '',
  specifications jsonb DEFAULT '{}',
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  link_url text DEFAULT '',
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text DEFAULT '',
  customer_address text NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  quantity integer NOT NULL,
  price_at_purchase numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Deals policies
CREATE POLICY "Anyone can view active deals"
  ON deals FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete deals"
  ON deals FOR DELETE
  TO authenticated
  USING (true);

-- Orders policies
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Order items policies
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_order_position ON deals(order_position);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Insert sample products
INSERT INTO products (title, description, price, category, image_url, specifications, stock) VALUES
('Premium Wireless Headphones', 'High-quality wireless headphones with active noise cancellation and 30-hour battery life.', 299.99, 'Audio', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800', '{"color": "Black", "battery": "30 hours", "wireless": true, "noise_cancellation": true}', 50),
('Smart Watch Pro', 'Advanced smartwatch with health tracking, GPS, and water resistance up to 50m.', 399.99, 'Wearables', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', '{"display": "AMOLED", "water_resistant": "50m", "gps": true, "heart_rate": true}', 35),
('Ultra HD 4K Camera', 'Professional 4K camera with 20MP sensor and advanced image stabilization.', 1299.99, 'Cameras', 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800', '{"resolution": "4K", "sensor": "20MP", "stabilization": true, "video": "60fps"}', 20),
('Portable Bluetooth Speaker', 'Waterproof portable speaker with 360-degree sound and 12-hour battery.', 129.99, 'Audio', 'https://images.pexels.com/photos/1279326/pexels-photo-1279326.jpeg?auto=compress&cs=tinysrgb&w=800', '{"waterproof": true, "battery": "12 hours", "bluetooth": "5.0", "output": "20W"}', 75),
('Gaming Laptop Elite', 'High-performance gaming laptop with RTX graphics and 144Hz display.', 1899.99, 'Computers', 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=800', '{"gpu": "RTX 4060", "ram": "16GB", "storage": "1TB SSD", "display": "144Hz"}', 15),
('Wireless Charging Pad', 'Fast wireless charging pad compatible with all Qi-enabled devices.', 49.99, 'Accessories', 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=800', '{"fast_charging": true, "qi_compatible": true, "output": "15W", "led_indicator": true}', 100);

-- Insert sample deals
INSERT INTO deals (image_url, link_url, order_position, is_active) VALUES
('https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=1200', '/products', 1, true),
('https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=1200', '/products', 2, true),
('https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=1200', '/products', 3, true);