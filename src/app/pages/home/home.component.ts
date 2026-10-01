import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ProductService } from '../../services/product.service';
import { WhatsAppService } from '../../services/whatsapp.service';
import { Category, Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    ProductCardComponent,
  ],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero__overlay"></div>
      <div class="tm-container hero__content">
        <h1 class="hero__title">MusoHive</h1>
        <p class="hero__tagline">Quality Music Accessories at Great Prices</p>
        <p class="hero__desc">
          In-ear monitors, audio cables, earphones, adapters, connectors and
          more. Browse our catalogue and order easily on WhatsApp.
        </p>
        <div class="hero__actions">
          <a mat-flat-button class="tm-primary-btn" routerLink="/shop">
            <mat-icon>storefront</mat-icon> Shop Now
          </a>
          <a
            mat-flat-button
            class="tm-whatsapp-btn"
            [href]="whatsapp.contactUrl()"
            target="_blank"
            rel="noopener"
          >
            <mat-icon>chat</mat-icon> Contact Us on WhatsApp
          </a>
        </div>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="tm-section">
      <div class="tm-container">
        <h2 class="tm-section-title">Featured Categories</h2>
        <p class="tm-section-subtitle">Find what you need across our range</p>
        <div class="cats-grid">
          @for (cat of categories(); track cat.id) {
            <a [routerLink]="['/categories', cat.slug]" class="cat-card">
              <div class="cat-card__img-wrap">
                <img [src]="cat.image_url" [alt]="cat.name" loading="lazy" />
              </div>
              <div class="cat-card__body">
                <h3>{{ cat.name }}</h3>
                <span class="cat-card__link"
                  >Browse <mat-icon>arrow_forward</mat-icon></span
                >
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="tm-section featured-section">
      <div class="tm-container">
        <div class="featured-header">
          <div>
            <h2 class="tm-section-title">Featured Products</h2>
            <p class="tm-section-subtitle">Popular picks from our catalogue</p>
          </div>
          <a mat-stroked-button class="tm-outline-btn" routerLink="/shop"
            >View All Products</a
          >
        </div>
        @if (featured().length) {
          <div class="products-grid">
            @for (product of featured(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>
        } @else {
          <p class="empty">Loading products...</p>
        }
      </div>
    </section>

    <!-- Why MusoHive -->
    <section class="tm-section why-section">
      <div class="tm-container">
        <h2 class="tm-section-title">Why MusoHive?</h2>
        <p class="tm-section-subtitle">We make ordering music gear simple</p>
        <div class="why-grid">
          <div class="why-card">
            <mat-icon class="why-card__icon">verified</mat-icon>
            <h3>Quality Products</h3>
            <p>Carefully selected accessories you can rely on.</p>
          </div>
          <div class="why-card">
            <mat-icon class="why-card__icon">sell</mat-icon>
            <h3>Affordable Prices</h3>
            <p>Great value across our entire range.</p>
          </div>
          <div class="why-card">
            <mat-icon class="why-card__icon">touch_app</mat-icon>
            <h3>Easy Ordering</h3>
            <p>Browse, pick, and order in just a few taps.</p>
          </div>
          <div class="why-card">
            <mat-icon class="why-card__icon">support_agent</mat-icon>
            <h3>WhatsApp Support</h3>
            <p>Local, friendly customer service via WhatsApp.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        position: relative;
        background:
          linear-gradient(135deg, rgba(0, 76, 64, 0.92), rgba(0, 121, 107, 0.85)),
          url('https://images.pexels.com/photos/3903095/pexels-photo-3903095.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')
            center / cover;
        color: #fff;
        padding: 96px 0;
        overflow: hidden;
      }
      .hero__content {
        position: relative;
        z-index: 1;
        max-width: 620px;
      }
      .hero__title {
        font-size: 3rem;
        font-weight: 700;
        margin: 0 0 8px;
        letter-spacing: -0.02em;
      }
      .hero__tagline {
        font-size: 1.35rem;
        font-weight: 600;
        margin: 0 0 16px;
        color: #b2dfdb;
      }
      .hero__desc {
        font-size: 1rem;
        line-height: 1.6;
        margin: 0 0 28px;
        color: #e0f2f1;
        max-width: 520px;
      }
      .hero__actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .hero__actions .tm-primary-btn {
        background: #fff !important;
        color: var(--tm-primary-dark) !important;
      }

      .cats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }
      .cat-card {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition: box-shadow 0.2s ease, transform 0.2s ease;
        display: block;
      }
      .cat-card:hover {
        box-shadow: var(--tm-shadow-hover);
        transform: translateY(-2px);
        text-decoration: none;
      }
      .cat-card__img-wrap {
        aspect-ratio: 16 / 10;
        overflow: hidden;
        background: var(--tm-bg);
      }
      .cat-card__img-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      .cat-card:hover .cat-card__img-wrap img {
        transform: scale(1.05);
      }
      .cat-card__body {
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-width: 0;
      }
      .cat-card__body h3 {
        margin: 0;
        min-width: 0;
        overflow-wrap: break-word;
      }
      .cat-card__link {
        flex-shrink: 0;
      }
      .cat-card__link mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }

      .featured-section {
        background: var(--tm-surface);
        border-top: 1px solid var(--tm-border);
        border-bottom: 1px solid var(--tm-border);
      }
      .featured-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .featured-header .tm-section-subtitle {
        margin-bottom: 0;
      }

      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
      }

      .why-section {
        background: var(--tm-bg);
      }
      .why-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }      .why-card {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        padding: 28px 20px;
        text-align: center;
      }
      .why-card__icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: var(--tm-primary);
        margin-bottom: 12px;
      }
      .why-card h3 {
        margin: 0 0 6px;
        font-size: 1.05rem;
      }
      .why-card p {
        margin: 0;
        font-size: 0.88rem;
        color: var(--tm-text-muted);
      }

      .empty {
        color: var(--tm-text-muted);
        padding: 24px 0;
      }

      @media (max-width: 768px) {
        .hero {
          padding: 56px 0;
        }
        .hero__title {
          font-size: 2.2rem;
        }
        .hero__tagline {
          font-size: 1.1rem;
        }
        .hero__desc {
          font-size: 0.92rem;
        }
        .cats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .products-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .why-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .why-card {
          padding: 20px 16px;
        }
        .featured-header {
          align-items: flex-start;
        }
      }
      @media (max-width: 480px) {
        .hero {
          padding: 40px 0;
        }
        .hero__title {
          font-size: 1.8rem;
        }
        .hero__tagline {
          font-size: 1rem;
        }
        .hero__actions {
          flex-direction: column;
        }
        .hero__actions a {
          width: 100%;
          justify-content: center;
        }
        .cats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .cat-card__body {
          padding: 12px;
          align-items: flex-start;
          flex-direction: column;
          gap: 6px;
        }
        .cat-card__body h3 {
          font-size: 0.9rem;
        }
        .products-grid {
          grid-template-columns: 1fr;
        }
        .why-grid {
          grid-template-columns: 1fr;
        }
        .featured-header {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }
        .featured-header a {
          width: 100%;
        }
      }
    `,
  ],
})
export class HomeComponent {
  private products = inject(ProductService);
  whatsapp = inject(WhatsAppService);

  categories = signal<Category[]>([]);
  featured = signal<Product[]>([]);

  constructor() {
    this.products.getCategories().subscribe((cats) => this.categories.set(cats));
    this.products
      .getFeaturedProducts()
      .subscribe((prods) => this.featured.set(prods));
  }
}
