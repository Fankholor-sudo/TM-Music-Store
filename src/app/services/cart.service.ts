import { Injectable, signal, computed, inject, DOCUMENT } from '@angular/core';
import { CartItem } from '@/app/models/order.model';
import { Product } from '@/app/models/product.model';

const STORAGE_KEY = 'musohive_cart';
const MAX_QTY = 99;

@Injectable({ providedIn: 'root' })
export class CartService {
  private document = inject(DOCUMENT);

  private items = signal<CartItem[]>(this.loadFromStorage());

  cartItems = computed(() => this.items());
  totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );
  subtotal = computed(() =>
    this.items().reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ),
  );


  addToCart(product: Product, quantity = 1, selectedImage?: string): void {
    const current = this.items();
    const imageUrl = selectedImage || product.image_url;

    const existing = current.find(
      (i) =>
        i.product_id === product.id &&
        i.image_url === imageUrl,
    );

    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, MAX_QTY);

      this.items.set(
        current.map((i) =>
          i.product_id === product.id && i.image_url === imageUrl
            ? { ...i, quantity: newQty }
            : i,
        ),
      );
    } else {
      this.items.set([
        ...current,
        {
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          price: product.price,
          image_url: imageUrl,
          quantity: Math.min(quantity, MAX_QTY),
          max_quantity: MAX_QTY,
        },
      ]);
    }

    this.saveToStorage();
  }

  updateQuantity(productId: string, imageUrl: string, quantity: number): void {
    if (quantity < 1) return;

    const clamped = Math.min(quantity, MAX_QTY);

    this.items.set(
      this.items().map((i) =>
        i.product_id === productId && i.image_url === imageUrl
          ? { ...i, quantity: clamped }
          : i,
      ),
    );

    this.saveToStorage();
  }

  increment(productId: string, imageUrl: string): void {
    const item = this.items().find(
      (i) => i.product_id === productId && i.image_url === imageUrl,
    );

    if (item) {
      this.updateQuantity(productId, imageUrl, item.quantity + 1);
    }
  }

  decrement(productId: string, imageUrl: string): void {
    const item = this.items().find(
      (i) => i.product_id === productId && i.image_url === imageUrl,
    );

    if (item) {
      if (item.quantity <= 1) {
        this.removeItem(productId, imageUrl);
      } else {
        this.updateQuantity(productId, imageUrl, item.quantity - 1);
      }
    }
  }

  removeItem(productId: string, imageUrl: string): void {
    this.items.set(
      this.items().filter(
        (i) => !(i.product_id === productId && i.image_url === imageUrl),
      ),
    );

    this.saveToStorage();
  }

  clearCart(): void {
    this.items.set([]);
    this.saveToStorage();
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    try {
      this.document.defaultView?.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.items()),
      );
    } catch {
      // ignore storage errors
    }
  }
}