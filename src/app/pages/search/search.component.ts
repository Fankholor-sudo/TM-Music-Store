import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, ProductCardComponent],
  template: `
    <div class="tm-container search-page">
      <header class="search-header">
        <h1>Search Results</h1>
        @if (query()) {
          <p>Showing results for "<strong>{{ query() }}</strong>" — {{ products().length }} found</p>
        } @else {
          <p>Enter a search term to find products.</p>
        }
      </header>

      @if (loading()) {
        <div class="state-msg">Searching...</div>
      } @else if (query() && products().length) {
        <div class="products-grid">
          @for (product of products(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      } @else if (query()) {
        <div class="state-msg">
          <mat-icon>search_off</mat-icon>
          <p>No products found for "{{ query() }}".</p>
          <a mat-flat-button class="tm-primary-btn" routerLink="/shop">Browse All Products</a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .search-page { padding: 24px 24px 64px; }
      .search-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 6px; }
      .search-header p { color: var(--tm-text-muted); margin: 0 0 28px; }
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
      }
      .state-msg { text-align: center; padding: 64px 20px; color: var(--tm-text-muted); }
      .state-msg mat-icon { font-size: 3rem; width: 3rem; height: 3rem; margin-bottom: 8px; }
      .state-msg p { margin: 0 0 16px; }
      @media (max-width: 768px) {
        .search-page { padding: 16px 0 48px; }
        .products-grid {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        .search-header h1 { font-size: 1.4rem; }
      }
      @media (max-width: 480px) {
        .products-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductService);

  query = signal('');
  products = signal<Product[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      this.query.set(q);
      if (q) {
        this.loading.set(true);
        this.productsService.getProducts({ search: q }).subscribe((prods) => {
          this.products.set(prods);
          this.loading.set(false);
        });
      } else {
        this.products.set([]);
      }
    });
  }
}
