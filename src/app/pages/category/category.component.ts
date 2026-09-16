import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { Category, Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, ProductCardComponent],
  template: `
    <div class="tm-container category-page">
      @if (category(); as cat) {
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <mat-icon>chevron_right</mat-icon>
          <a routerLink="/shop">Shop</a>
          <mat-icon>chevron_right</mat-icon>
          <span>{{ cat.name }}</span>
        </nav>

        <header class="category-header">
          <h1>{{ cat.name }}</h1>
          @if (cat.description) {
            <p>{{ cat.description }}</p>
          }
        </header>

        @if (loading()) {
          <div class="state-msg">Loading products...</div>
        } @else if (products().length) {
          <div class="products-grid">
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>
        } @else {
          <div class="state-msg">
            <mat-icon>inventory_2</mat-icon>
            <p>No products in this category yet.</p>
            <a mat-flat-button class="tm-primary-btn" routerLink="/shop">Browse All Products</a>
          </div>
        }
      } @else if (loading()) {
        <div class="state-msg">Loading...</div>
      } @else {
        <div class="state-msg">
          <mat-icon>search_off</mat-icon>
          <h2>Category not found</h2>
          <a mat-flat-button class="tm-primary-btn" routerLink="/shop">Back to Shop</a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .category-page { padding: 24px 24px 64px; }
      .breadcrumb {
        display: flex; align-items: center; gap: 4px;
        font-size: 0.82rem; color: var(--tm-text-muted); margin-bottom: 24px;
        flex-wrap: wrap;
      }
      .breadcrumb a { color: var(--tm-primary); text-decoration: none; }
      .breadcrumb a:hover { text-decoration: underline; }
      .breadcrumb mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
      .breadcrumb span { color: var(--tm-text); font-weight: 500; }
      .category-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 6px; }
      .category-header p { color: var(--tm-text-muted); margin: 0 0 28px; max-width: 600px; }
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
      }
      .state-msg { text-align: center; padding: 64px 20px; color: var(--tm-text-muted); }
      .state-msg mat-icon { font-size: 3rem; width: 3rem; height: 3rem; margin-bottom: 8px; }
      .state-msg h2 { margin: 0 0 16px; color: var(--tm-text); }
      .state-msg p { margin: 0 0 16px; }
      @media (max-width: 768px) {
        .category-page { padding: 16px 0 48px; }
        .products-grid {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        .category-header h1 { font-size: 1.4rem; }
      }
      @media (max-width: 480px) {
        .products-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductService);

  category = signal<Category | null>(null);
  products = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.productsService.getCategories().subscribe((cats) => {
        const cat = cats.find((c) => c.slug === slug) ?? null;
        this.category.set(cat);
        if (cat) {
          this.productsService
            .getProducts({ category: cat.id })
            .subscribe((prods) => {
              this.products.set(prods);
              this.loading.set(false);
            });
        } else {
          this.loading.set(false);
        }
      });
    });
  }
}
