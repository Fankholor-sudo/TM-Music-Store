import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Product } from '../../models/product.model';
import { WhatsAppService } from '../../services/whatsapp.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <article class="card">
      <a [routerLink]="['/products', product.slug]" class="card__img-link">
        <img
          [src]="product.image_url"
          [alt]="product.name"
          loading="lazy"
          class="card__img"
        />
        <span [class]="'tm-badge ' + badgeClass(product.availability)">{{
          product.availability
        }}</span>
      </a>
      <div class="card__body">
        <div class="card__brand">{{ product.brand }}</div>
        <h3 class="card__name">
          <a [routerLink]="['/products', product.slug]">{{ product.name }}</a>
        </h3>
        <p class="card__desc">{{ product.description }}</p>
        <div class="card__price-row">
          <span class="tm-price">R{{ product.price.toFixed(2) }}</span>
        </div>
        <div class="card__actions">
          <a
            mat-stroked-button
            class="tm-outline-btn"
            [routerLink]="['/products', product.slug]"
            >View Product</a
          >
          <a
            mat-flat-button
            class="tm-whatsapp-btn"
            [href]="whatsapp.orderUrl(product)"
            target="_blank"
            rel="noopener"
          >
            <mat-icon>chat</mat-icon>
            Order
          </a>
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      .card {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: box-shadow 0.2s ease, transform 0.2s ease;
        height: 100%;
      }
      .card:hover {
        box-shadow: var(--tm-shadow-hover);
        transform: translateY(-2px);
      }
      .card__img-link {
        position: relative;
        display: block;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        background: var(--tm-bg);
      }
      .card__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      .card:hover .card__img {
        transform: scale(1.04);
      }
      .card .tm-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        backdrop-filter: blur(4px);
      }
      .card__body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .card__brand {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--tm-text-muted);
        margin-bottom: 4px;
      }
      .card__name {
        font-size: 1.05rem;
        font-weight: 600;
        margin: 0 0 8px;
        line-height: 1.3;
      }
      .card__name a {
        color: var(--tm-text);
        text-decoration: none;
      }
      .card__name a:hover {
        color: var(--tm-primary);
        text-decoration: none;
      }
      .card__desc {
        font-size: 0.85rem;
        color: var(--tm-text-muted);
        margin: 0 0 14px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex: 1;
      }
      .card__price-row {
        margin-bottom: 14px;
      }
      .card__actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: auto;
      }
      .card__actions a {
        width: 100%;
        white-space: nowrap;
      }

      @media (min-width: 480px) {
        .card__actions {
          flex-direction: row;
        }
        .card__actions a {
          flex: 1;
        }
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  whatsapp = inject(WhatsAppService);

  badgeClass(availability: string): string {
    switch (availability) {
      case 'In Stock':
        return 'tm-badge--in-stock';
      case 'Low Stock':
        return 'tm-badge--low-stock';
      case 'Out of Stock':
        return 'tm-badge--out-of-stock';
      case 'Pre-Order':
        return 'tm-badge--pre-order';
      default:
        return 'tm-badge--in-stock';
    }
  }
}
