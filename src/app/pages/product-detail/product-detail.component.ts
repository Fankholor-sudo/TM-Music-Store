import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { ProductService } from '../../services/product.service';
import { WhatsAppService } from '../../services/whatsapp.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ProductCardComponent,
  ],
  template: `
    <div class="tm-container detail-page">
      @if (product(); as p) {
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <mat-icon>chevron_right</mat-icon>
          <a routerLink="/shop">Shop</a>
          @if (p.category) {
            <mat-icon>chevron_right</mat-icon>
            <a [routerLink]="['/categories', p.category.slug]">{{ p.category.name }}</a>
          }
          <mat-icon>chevron_right</mat-icon>
          <span>{{ p.name }}</span>
        </nav>

        <div class="detail-grid">
          <div class="detail-images">
            <div class="main-img-wrap">
              <img [src]="activeImage()" [alt]="p.name" class="main-img" />
              <span [class]="'tm-badge ' + badgeClass(p.availability)">{{
                p.availability
              }}</span>
            </div>
            @if (allImages(p).length > 1) {
              <div class="thumbs">
                @for (img of allImages(p); track img) {
                  <button
                    class="thumb"
                    [class.active]="img === activeImage()"
                    (click)="activeImage.set(img)"
                  >
                    <img [src]="img" [alt]="p.name" />
                  </button>
                }
              </div>
            }
          </div>

          <div class="detail-info">
            <div class="detail-brand">{{ p.brand }}</div>
            <h1 class="detail-name">{{ p.name }}</h1>
            <div class="detail-price-row">
              <span class="tm-price detail-price">R{{ p.price.toFixed(2) }}</span>
              @if (p.category) {
                <a [routerLink]="['/categories', p.category.slug]" class="detail-cat">
                  <mat-icon>category</mat-icon> {{ p.category.name }}
                </a>
              }
            </div>
            <p class="detail-desc">{{ p.description }}</p>

            <div class="detail-actions">
              <a
                mat-flat-button
                class="tm-whatsapp-btn detail-order-btn"
                [href]="whatsapp.orderUrl(p)"
                target="_blank"
                rel="noopener"
              >
                <mat-icon>chat</mat-icon> Order on WhatsApp
              </a>
              <a
                mat-stroked-button
                class="tm-outline-btn"
                [href]="whatsapp.contactUrl('I have a question about the ' + p.name + '.')"
                target="_blank"
                rel="noopener"
              >
                <mat-icon>help_outline</mat-icon> Ask a Question
              </a>
            </div>

            @if (hasSpecs(p)) {
              <div class="specs">
                <h3>Specifications</h3>
                <table>
                  @for (entry of specEntries(p); track entry.key) {
                    <tr>
                      <td class="specs__key">{{ entry.key }}</td>
                      <td class="specs__val">{{ entry.value }}</td>
                    </tr>
                  }
                </table>
              </div>
            }
          </div>
        </div>

        @if (related().length) {
          <section class="related">
            <h2 class="tm-section-title">You may also like</h2>
            <div class="products-grid">
              @for (rel of related(); track rel.id) {
                <app-product-card [product]="rel" />
              }
            </div>
          </section>
        }
      } @else if (loading()) {
        <div class="state-msg">Loading product...</div>
      } @else {
        <div class="state-msg">
          <mat-icon>search_off</mat-icon>
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist or may have been removed.</p>
          <a mat-flat-button class="tm-primary-btn" routerLink="/shop">Back to Shop</a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .detail-page {
        padding: 24px 24px 64px;
      }
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.82rem;
        color: var(--tm-text-muted);
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      .breadcrumb a {
        color: var(--tm-primary);
        text-decoration: none;
      }
      .breadcrumb a:hover {
        text-decoration: underline;
      }
      .breadcrumb mat-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
      }
      .breadcrumb span {
        color: var(--tm-text);
        font-weight: 500;
      }
      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
      }
      .main-img-wrap {
        position: relative;
        border-radius: var(--tm-radius);
        overflow: hidden;
        border: 1px solid var(--tm-border);
        background: var(--tm-surface);
        aspect-ratio: 1;
      }
      .main-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .main-img-wrap .tm-badge {
        position: absolute;
        top: 14px;
        left: 14px;
      }
      .thumbs {
        display: flex;
        gap: 10px;
        margin-top: 12px;
        flex-wrap: wrap;
      }
      .thumb {
        width: 72px;
        height: 72px;
        border-radius: var(--tm-radius-sm);
        overflow: hidden;
        border: 2px solid var(--tm-border);
        background: none;
        cursor: pointer;
        padding: 0;
        transition: border-color 0.15s ease;
      }
      .thumb.active {
        border-color: var(--tm-primary);
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .detail-brand {
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--tm-text-muted);
        margin-bottom: 6px;
      }
      .detail-name {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 14px;
        line-height: 1.25;
      }
      .detail-price-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .detail-price {
        font-size: 1.6rem;
      }
      .detail-cat {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.85rem;
        color: var(--tm-primary);
        text-decoration: none;
        background: rgba(0, 121, 107, 0.08);
        padding: 5px 12px;
        border-radius: 999px;
      }
      .detail-cat:hover {
        text-decoration: none;
        background: rgba(0, 121, 107, 0.14);
      }
      .detail-cat mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
      .detail-desc {
        font-size: 0.95rem;
        line-height: 1.7;
        color: var(--tm-text-muted);
        margin: 0 0 28px;
      }
      .detail-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 32px;
      }
      .detail-actions a {
        width: 100%;
        justify-content: center;
      }
      .detail-order-btn {
        height: 48px;
        font-size: 1rem;
        padding: 0 24px;
      }
      @media (min-width: 600px) {
        .detail-actions {
          flex-direction: row;
        }
        .detail-actions a {
          width: auto;
          flex: 1;
        }
      }
      .specs {
        border-top: 1px solid var(--tm-border);
        padding-top: 24px;
      }
      .specs h3 {
        margin: 0 0 14px;
        font-size: 1.1rem;
      }
      .specs table {
        width: 100%;
        border-collapse: collapse;
      }
      .specs tr {
        border-bottom: 1px solid var(--tm-border);
      }
      .specs td {
        padding: 10px 0;
        font-size: 0.9rem;
      }
      .specs__key {
        font-weight: 600;
        width: 45%;
        color: var(--tm-text);
      }
      .specs__val {
        color: var(--tm-text-muted);
      }

      .related {
        margin-top: 64px;
        border-top: 1px solid var(--tm-border);
        padding-top: 40px;
      }
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }
      .state-msg {
        text-align: center;
        padding: 80px 20px;
        color: var(--tm-text-muted);
      }
      .state-msg mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 8px;
      }
      .state-msg h2 {
        margin: 0 0 8px;
        color: var(--tm-text);
      }
      .state-msg p {
        margin: 0 0 20px;
      }

      @media (max-width: 800px) {
        .detail-grid {
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .detail-name {
          font-size: 1.4rem;
        }
        .detail-price {
          font-size: 1.3rem;
        }
        .products-grid {
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        }
      }
      @media (max-width: 480px) {
        .detail-page {
          padding: 16px 0 48px;
        }
        .breadcrumb {
          margin-bottom: 16px;
        }
        .detail-name {
          font-size: 1.25rem;
        }
        .thumb {
          width: 56px;
          height: 56px;
        }
      }
    `,
  ],
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductService);
  whatsapp = inject(WhatsAppService);

  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  activeImage = signal<string>('');
  loading = signal(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.productsService.getProductBySlug(slug).subscribe((p) => {
        this.product.set(p);
        this.activeImage.set(p?.image_url ?? '');
        this.loading.set(false);
        if (p) {
          this.loadRelated(p);
        }
      });
    });
  }

  private loadRelated(p: Product): void {
    this.productsService
      .getProducts({ category: p.category_id ?? undefined, sort: 'recommended' })
      .subscribe((prods) => {
        this.related.set(prods.filter((x) => x.id !== p.id).slice(0, 4));
      });
  }

  allImages(p: Product): string[] {
    return [p.image_url, ...p.additional_images];
  }

  hasSpecs(p: Product): boolean {
    return Object.keys(p.specifications).length > 0;
  }

  specEntries(p: Product): { key: string; value: string }[] {
    return Object.entries(p.specifications).map(([key, value]) => ({
      key,
      value,
    }));
  }

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
