import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { Category, Product, SortOption } from '../models/product.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private supabase = inject(SupabaseService).supabase;

  getCategories(): Observable<Category[]> {
    return from(
      this.supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true }),
    ).pipe(map((res) => res.data as Category[]));
  }

  getFeaturedProducts(): Observable<Product[]> {
    return from(
      this.supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('featured', true)
        .order('created_at', { ascending: false }),
    ).pipe(map((res) => res.data as Product[]));
  }

  getProducts(options?: {
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
    sort?: SortOption;
  }): Observable<Product[]> {
    let query = this.supabase
      .from('products')
      .select('*, category:categories(*)');

    if (options?.category && options.category !== 'all') {
      query = query.eq('category_id', options.category);
    }
    if (options?.brand && options.brand !== 'all') {
      query = query.eq('brand', options.brand);
    }
    if (options?.search) {
      query = query.or(
        `name.ilike.%${options.search}%,brand.ilike.%${options.search}%,description.ilike.%${options.search}%`,
      );
    }
    if (options?.minPrice != null) {
      query = query.gte('price', options.minPrice);
    }
    if (options?.maxPrice != null) {
      query = query.lte('price', options.maxPrice);
    }
    if (options?.availability && options.availability !== 'all') {
      query = query.eq('availability', options.availability);
    }

    switch (options?.sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'price-low-high':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high-low':
        query = query.order('price', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      default:
        query = query.order('featured', { ascending: false }).order('name', { ascending: true });
    }

    return from(query).pipe(map((res) => res.data as Product[]));
  }

  getProductBySlug(slug: string): Observable<Product | null> {
    return from(
      this.supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle(),
    ).pipe(map((res) => res.data as Product | null));
  }

  getBrands(): Observable<string[]> {
    return from(
      this.supabase.from('products').select('brand'),
    ).pipe(
      map((res) => {
        const rows = res.data as { brand: string }[] | null;
        const brands = (rows ?? []).map((r) => r.brand);
        return [...new Set(brands)].sort((a, b) => a.localeCompare(b));
      }),
    );
  }
}
