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

  addToCart(product: Product, quantity = 1): void {
    const current = this.items();
    const existing = current.find((i) => i.product_id === product.id);
    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, MAX_QTY);
      this.items.set(
        current.map((i) =>
          i.product_id === product.id ? { ...i, quantity: newQty } : i,
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
          image_url: product.image_url,
          quantity: Math.min(quantity, MAX_QTY),
          max_quantity: MAX_QTY,
        },
      ]);
    }
    this.saveToStorage();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) return;
    const clamped = Math.min(quantity, MAX_QTY);
    this.items.set(
      this.items().map((i) =>
        i.product_id === productId ? { ...i, quantity: clamped } : i,
      ),
    );
    this.saveToStorage();
  }

  increment(productId: string): void {
    const item = this.items().find((i) => i.product_id === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity + 1);
    }
  }

  decrement(productId: string): void {
    const item = this.items().find((i) => i.product_id === productId);
    if (item) {
      if (item.quantity <= 1) {
        this.removeItem(productId);
      } else {
        this.updateQuantity(productId, item.quantity - 1);
      }
    }
  }

  removeItem(productId: string): void {
    this.items.set(this.items().filter((i) => i.product_id !== productId));
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