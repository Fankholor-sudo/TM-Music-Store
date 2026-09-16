export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category_id: string | null;
  description: string;
  price: number;
  image_url: string;
  additional_images: string[];
  specifications: Record<string, string>;
  availability: string;
  featured: boolean;
  created_at: string;
  category?: Category | null;
}

export type AvailabilityStatus =
  | 'In Stock'
  | 'Low Stock'
  | 'Out of Stock'
  | 'Pre-Order';

export type SortOption =
  | 'recommended'
  | 'newest'
  | 'price-low-high'
  | 'price-high-low'
  | 'name';
