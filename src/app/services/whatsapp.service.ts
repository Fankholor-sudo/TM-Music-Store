import { Injectable, inject, DOCUMENT } from '@angular/core';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private number = environment.whatsappNumber;
  private document = inject(DOCUMENT);

  buildProductUrl(product: Product, imgIndex?: number): string {
    const base = new URL(
      `/products/${product.slug}`,
      this.document.location?.origin || 'https://www.musohive.co.za'
    ).toString();

    return imgIndex != null && imgIndex > 0 ? `${base}?img=${imgIndex}`
      : base;
  }

  buildOrderMessage(product: Product, imgIndex?: number): string {
    const lines = [
      `Hello ${environment.storeName}, I am interested in ordering:`,
      '',
      `Product: ${product.name}`,
      `Link: ${this.buildProductUrl(product, imgIndex)}`,
      '',
      'Please let me know if this product is available.',
    ];

    return encodeURIComponent(lines.join('\n'));
  }

  buildContactMessage(text: string): string {
    return encodeURIComponent(
      `Hello ${environment.storeName}, ${text}`,
    );
  }

  orderUrl(product: Product, imgIndex?: number): string {
    return `https://wa.me/${this.number}?text=${this.buildOrderMessage(product, imgIndex)}`;
  }

  contactUrl(text = ''): string {
    const message = text || `I'd like to find out more about your products.`;
    return `https://wa.me/${this.number}?text=${this.buildContactMessage(message)}`;
  }
}
