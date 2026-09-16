import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Category, Product, SortOption } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatExpansionModule,
    FormsModule,
    ProductCardComponent,
  ],
  template: `
    <div class="shop-header">
      <div class="tm-container">
        <h1>Shop All Products</h1>
        <p>Browse our full range of music accessories</p>
      </div>
    </div>

    <div class="tm-container shop-layout">
      <!-- Filters sidebar -->
      <aside class="filters">
        <div class="filters__header">
          <h2>Filters</h2>
          <button mat-stroked-button class="tm-outline-btn filters__reset" (click)="resetFilters()">
            <mat-icon>refresh</mat-icon> Reset
          </button>
        </div>

        <div class="filters__group">
          <label class="filters__label">Category</label>
          <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
            <mat-select [(value)]="selectedCategory" (selectionChange)="applyFilters()">
              <mat-option value="all">All Categories</mat-option>
              @for (cat of categories(); track cat.id) {
                <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="filters__group">
          <label class="filters__label">Brand</label>
          <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
            <mat-select [(value)]="selectedBrand" (selectionChange)="applyFilters()">
              <mat-option value="all">All Brands</mat-option>
              @for (brand of brands(); track brand) {
                <mat-option [value]="brand">{{ brand }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="filters__group">
          <label class="filters__label">Price Range</label>
          <div class="price-inputs">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Min</mat-label>
              <input matInput type="number" [(ngModel)]="minPrice" (ngModelChange)="applyFilters()" />
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Max</mat-label>
              <input matInput type="number" [(ngModel)]="maxPrice" (ngModelChange)="applyFilters()" />
            </mat-form-field>
          </div>
        </div>

        <div class="filters__group">
          <label class="filters__label">Availability</label>
          <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
            <mat-select [(value)]="selectedAvailability" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="In Stock">In Stock</mat-option>
              <mat-option value="Low Stock">Low Stock</mat-option>
              <mat-option value="Out of Stock">Out of Stock</mat-option>
              <mat-option value="Pre-Order">Pre-Order</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </aside>

      <!-- Products -->
      <div class="shop-content">
        <div class="shop-toolbar">
          <span class="shop-count">{{ products().length }} products</span>
          <mat-form-field appearance="outline" class="sort-field" subscriptSizing="dynamic">
            <mat-label>Sort by</mat-label>
            <mat-select [(value)]="selectedSort" (selectionChange)="applyFilters()">
              <mat-option value="recommended">Recommended</mat-option>
              <mat-option value="newest">Newest</mat-option>
              <mat-option value="price-low-high">Price: Low to High</mat-option>
              <mat-option value="price-high-low">Price: High to Low</mat-option>
              <mat-option value="name">Name</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

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
            <mat-icon>search_off</mat-icon>
            <p>No products match your filters.</p>
            <button mat-stroked-button class="tm-outline-btn" (click)="resetFilters()">
              Clear Filters
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .shop-header {
        background: var(--tm-surface);
        border-bottom: 1px solid var(--tm-border);
        padding: 32px 0;
      }
      .shop-header h1 {
        margin: 0 0 4px;
        font-size: 1.75rem;
        font-weight: 700;
      }
      .shop-header p {
        margin: 0;
        color: var(--tm-text-muted);
      }
      .shop-layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 28px;
        padding-top: 32px;
        padding-bottom: 64px;
      }
      .filters {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        padding: 24px;
        height: fit-content;
      }
      .filters__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--tm-border);
      }
      .filters__header h2 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 700;
      }
      .filters__reset {
        font-size: 0.8rem;
        padding: 0 12px;
        height: 32px;
      }
      .filters__group {
        margin-bottom: 20px;
      }
      .filters__label {
        display: block;
        margin: 0 0 6px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--tm-text);
      }
      .full-width {
        width: 100%;
      }
      .price-inputs {
        display: flex;
        gap: 10px;
      }
      .price-inputs mat-form-field {
        flex: 1;
        min-width: 0;
      }
      .shop-content {
        min-width: 0;
      }
      .shop-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 12px;
        flex-wrap: wrap;
      }
      .shop-count {
        font-size: 0.9rem;
        color: var(--tm-text-muted);
        font-weight: 500;
      }
      .sort-field {
        width: 200px;
        flex-shrink: 0;
      }
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
      }
      .state-msg {
        text-align: center;
        padding: 64px 20px;
        color: var(--tm-text-muted);
      }
      .state-msg mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: var(--tm-text-muted);
        margin-bottom: 8px;
      }
      .state-msg p {
        margin: 0 0 16px;
      }

      @media (max-width: 768px) {
        .shop-layout {
          grid-template-columns: minmax(0, 1fr);
          gap: 20px;
        }

        .filters {
          padding: 16px;
        }

        .sort-field {
          width: 100%;
        }

        .shop-toolbar {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .products-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
      }

      @media (max-width: 480px) {
        .shop-header {
          padding: 24px 0;
        }

        .shop-header h1 {
          font-size: 1.4rem;
        }

        .products-grid {
          grid-template-columns: minmax(0, 1fr);
          gap: 16px;
        }

        .filters__header {
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    `,
  ],
})
export class ShopComponent implements OnInit {
  private productsService = inject(ProductService);

  categories = signal<Category[]>([]);
  brands = signal<string[]>([]);
  products = signal<Product[]>([]);
  loading = signal(true);

  selectedCategory = 'all';
  selectedBrand = 'all';
  selectedAvailability = 'all';
  selectedSort: SortOption = 'recommended';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  ngOnInit(): void {
    this.productsService.getCategories().subscribe((c) => this.categories.set(c));
    this.productsService.getBrands().subscribe((b) => this.brands.set(b));
    this.applyFilters();
  }

  applyFilters(): void {
    this.loading.set(true);
    this.productsService
      .getProducts({
        category: this.selectedCategory,
        brand: this.selectedBrand,
        availability: this.selectedAvailability,
        sort: this.selectedSort,
        minPrice: this.minPrice != null ? this.minPrice : undefined,
        maxPrice: this.maxPrice != null ? this.maxPrice : undefined,
      })
      .subscribe((prods) => {
        this.products.set(prods);
        this.loading.set(false);
      });
  }

  resetFilters(): void {
    this.selectedCategory = 'all';
    this.selectedBrand = 'all';
    this.selectedAvailability = 'all';
    this.selectedSort = 'recommended';
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilters();
  }
}
