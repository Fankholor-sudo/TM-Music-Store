import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private number = environment.whatsappNumber;

  buildProductUrl(product: Product, imgIndex?: number): string {
    const base = `${window.location.origin}/products/${product.slug}`;
    return imgIndex != null && imgIndex > 0 ? `${base}?img=${imgIndex}` : base;
  }

  buildOrderMessage(product: Product, imgIndex?: number, imageUrl?: string): string {
    const lines = [
      `Hello ${environment.storeName}, I am interested in ordering:`,
      '',
      `Product: ${product.name}`,
      `Brand: ${product.brand}`,
      `Price: R${product.price.toFixed(2)}`,
      `Link: ${this.buildProductUrl(product, imgIndex)}`,
    ];
    if (imageUrl) {
      lines.push(`Image: ${imageUrl}`);
    }
    lines.push('', 'Please let me know if this product is available.');
    return encodeURIComponent(lines.join('\n'));
  }

  buildContactMessage(text: string): string {
    return encodeURIComponent(
      `Hello ${environment.storeName}, ${text}`,
    );
  }

  orderUrl(product: Product, imgIndex?: number, imageUrl?: string): string {
    return `https://wa.me/${this.number}?text=${this.buildOrderMessage(product, imgIndex, imageUrl)}`;
  }

  contactUrl(text = ''): string {
    const message = text || `I'd like to find out more about your products.`;
    return `https://wa.me/${this.number}?text=${this.buildContactMessage(message)}`;
  }
}
