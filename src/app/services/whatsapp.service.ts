import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private number = environment.whatsappNumber;

  buildProductUrl(product: Product): string {
    return `${window.location.origin}/products/${product.slug}`;
  }

  buildOrderMessage(product: Product): string {
    const lines = [
      `Hello ${environment.storeName}, I am interested in ordering:`,
      '',
      `Product: ${product.name}`,
      `Brand: ${product.brand}`,
      `Price: R${product.price.toFixed(2)}`,
      `Link: ${this.buildProductUrl(product)}`,
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

  orderUrl(product: Product): string {
    return `https://wa.me/${this.number}?text=${this.buildOrderMessage(product)}`;
  }

  contactUrl(text = ''): string {
    const message = text || `I'd like to find out more about your products.`;
    return `https://wa.me/${this.number}?text=${this.buildContactMessage(message)}`;
  }
}
