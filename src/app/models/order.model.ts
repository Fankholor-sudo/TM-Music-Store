export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  shipping_method: 'pep_store' | 'door_delivery';
  pep_store_location: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_postal_code: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_status: string;
  paystack_reference: string | null;
  paystack_access_code: string | null;
  items_json: OrderItem[];
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  image_url: string;
  quantity: number;
  max_quantity: number;
}