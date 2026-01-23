import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  additional_images: never[];
  unit: string;
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  specifications: Record<string, any>;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  expires_at: any;
  id: string;
  image_url: string;
  link_url: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_price: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  image_url?: string; // Add this line
  created_at: string;
}