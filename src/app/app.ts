import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from './services/product.service';
import { Category } from './models/product.model';
import { WhatsAppService } from './services/whatsapp.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav
        #drawer
        class="mobile-nav"
        [mode]="'over'"
        [fixedInViewport]="true"
        position="end"
      >
        <div class="mobile-nav__header">
          <img
            src="/images/logo/logo-black.png"
            alt="MusoHive"
            class="tm-header_logo-img"
          />
          <button mat-icon-button (click)="drawer.close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <form class="mobile-nav__search" (ngSubmit)="onSearch(); drawer.close()">
          <mat-form-field appearance="outline" class="mobile-nav__search-field" subscriptSizing="dynamic">
            <mat-icon matPrefix class="search-icon">search</mat-icon>
            <input
              matInput
              placeholder="Search products..."
              [(ngModel)]="searchTerm"
              name="searchTerm"
            />
          </mat-form-field>
        </form>
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/"
            routerLinkActive="active-link"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="drawer.close()"
          >
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>Home</span>
          </a>
          <a
            mat-list-item
            routerLink="/shop"
            routerLinkActive="active-link"
            (click)="drawer.close()"
          >
            <mat-icon matListItemIcon>storefront</mat-icon>
            <span matListItemTitle>Shop</span>
          </a>
          <a
            mat-list-item
            routerLink="/about"
            routerLinkActive="active-link"
            (click)="drawer.close()"
          >
            <mat-icon matListItemIcon>info</mat-icon>
            <span matListItemTitle>About</span>
          </a>
          <a
            mat-list-item
            routerLink="/contact"
            routerLinkActive="active-link"
            (click)="drawer.close()"
          >
            <mat-icon matListItemIcon>contact_support</mat-icon>
            <span matListItemTitle>Contact</span>
          </a>
        </mat-nav-list>
        <div class="mobile-nav__divider"></div>
        <div class="mobile-nav__cats-label">Categories</div>
        <mat-nav-list>
          @for (cat of categories(); track cat.id) {
            <a
              mat-list-item
              [routerLink]="['/categories', cat.slug]"
              (click)="drawer.close()"
            >
              <span matListItemTitle>{{ cat.name }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <header class="tm-header">
          <div class="tm-header__topbar">
            <div class="tm-container tm-header__inner">
              <div class="tm-header__brand">
                <a routerLink="/">
                  <img
                    src="/images/logo/logo-black.png"
                    alt="MusoHive"
                    class="tm-header_logo-img"
                  />
                </a>
              </div>

              <nav class="tm-header__nav">
                <a
                  routerLink="/"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                  >Home</a
                >
                <a routerLink="/shop" routerLinkActive="active">Shop</a>

                <button
                  mat-button
                  [matMenuTriggerFor]="catMenu"
                  class="tm-header__cat-btn"
                  aria-label="Product categories"
                >
                  <span>Categories</span>
                  <mat-icon class="tm-header__cat-arrow">expand_more</mat-icon>
                </button>
                <mat-menu #catMenu="matMenu">
                  @for (cat of categories(); track cat.id) {
                    <a
                      mat-menu-item
                      [routerLink]="['/categories', cat.slug]">
                      {{ cat.name }}
                    </a>
                  }
                </mat-menu>
                <a routerLink="/about" routerLinkActive="active">About</a>
                <a routerLink="/contact" routerLinkActive="active">Contact</a>
              </nav>

              <div class="tm-header__actions">
                <form
                  class="tm-header__search"
                  (ngSubmit)="onSearch()"
                >
                  <mat-form-field
                    appearance="outline"
                    class="tm-header__search-field"
                    subscriptSizing="dynamic"
                  >
                    <mat-icon matPrefix class="search-icon">search</mat-icon>
                    <input
                      matInput
                      placeholder="Search products..."
                      [(ngModel)]="searchTerm"
                      name="searchTerm"
                    />
                  </mat-form-field>
                </form>

                <a
                  mat-flat-button
                  class="tm-whatsapp-btn tm-header__wa"
                  [href]="whatsapp.contactUrl()"
                  target="_blank"
                  rel="noopener"
                >
                  <mat-icon>chat</mat-icon>
                  <span class="tm-header__wa-label">WhatsApp</span>
                </a>

                <button
                  mat-icon-button
                  class="tm-header__menu-btn"
                  (click)="drawer.toggle()"
                  aria-label="Toggle menu"
                >
                  <mat-icon>menu</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main class="tm-main">
          <router-outlet />
        </main>

        <footer class="tm-footer">
          <div class="tm-container tm-footer__inner">
            <div class="tm-footer__col tm-footer__brand">
              <div class="tm-footer__logo">
                <img
                  src="/images/logo/logo-light.png"
                  alt="MusoHive"
                  class="tm-header_logo-img"
                />
              </div>
              <p class="tm-footer__tagline">
                Quality music accessories at great prices. In-ear monitors,
                cables, earphones, adapters and more.
              </p>
              <a
                mat-flat-button
                class="tm-whatsapp-btn"
                [href]="whatsapp.contactUrl()"
                target="_blank"
                rel="noopener"
              >
                <mat-icon>chat</mat-icon> Contact us on WhatsApp
              </a>
            </div>
            <div class="tm-footer__col">
              <h4>Shop</h4>
              <a routerLink="/shop">All Products</a>
              @for (cat of categories().slice(0, 4); track cat.id) {
                <a [routerLink]="['/categories', cat.slug]">{{ cat.name }}</a>
              }
            </div>
            <div class="tm-footer__col">
              <h4>Company</h4>
              <a routerLink="/about">About Us</a>
              <a routerLink="/contact">Contact</a>
              <a [href]="whatsapp.contactUrl()" target="_blank" rel="noopener"
                >WhatsApp Support</a
              >
            </div>
          </div>
          <div class="tm-footer__bar">
            <div class="tm-container">
              &copy; {{ year }} MusoHive. All rights reserved.
            </div>
          </div>
        </footer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
      }
      .tm-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: var(--tm-surface);
        border-bottom: 1px solid var(--tm-border);
        box-shadow: var(--tm-shadow);
      }
      .tm-header__inner {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        height: 68px;
      }
      .tm-header__brand a {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
      }
      .tm-header__brand {
        min-width: 0;
      }
      .tm-header_logo-img {
        display: block;
        width: 120px;
        height: auto;
        max-height: none;
        object-fit: contain;
      }
      .tm-header__nav {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .tm-header__nav a {
        display: inline-flex;
        align-items: center;

        padding: 8px 14px;
        border-radius: 6px;

        font-weight: 500;
        font-size: 0.92rem;
        color: var(--tm-text);
        text-decoration: none;

        transition: background 0.15s ease, color 0.15s ease;
      }
      .tm-header__cat-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;

        padding: 8px 14px;
        border-radius: 6px;

        font-family: inherit;
        font-weight: 500;
        font-size: 0.92rem;
        color: var(--tm-text);

        background: transparent;
        border: 0;
        cursor: pointer;

        transition: background 0.15s ease, color 0.15s ease;
      }
      .tm-header__nav a:hover,
      .tm-header__cat-btn:hover {
        background: var(--tm-bg);
        text-decoration: none;
      }
      .tm-header__nav a.active {
        color: var(--tm-primary);
        background: rgba(0, 121, 107, 0.08);
      }
      .tm-header__cat-arrow {
        flex: 0 0 auto;
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        margin-left: 2px;
      }
      .tm-header__actions {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .tm-header__search {
        display: flex;
        align-items: center;
      }
      .tm-header__actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .tm-header__search-field .mdc-notched-outline__leading,
      .tm-header__search-field .mdc-notched-outline__notch,
      .tm-header__search-field .mdc-notched-outline__trailing {
        border-radius: 999px;
      }
      .search-icon {
        color: var(--tm-text-muted);
      }
      .tm-header__wa {
        height: 40px;
      }
      .tm-header__menu-btn {
        display: none;
      }
      .tm-main {
        min-height: 60vh;
        padding-top: 68px;
      }

      /* Footer */
      .tm-footer {
        background: #1a1f24;
        color: #c4ccd4;
        margin-top: 64px;
      }
      .tm-footer__inner {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr;
        gap: 40px;
        padding: 56px 24px 40px;
      }
      .tm-footer__brand .tm-footer__logo {
        font-size: 1.3rem;
        font-weight: 700;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
      }
      .tm-footer__brand .tm-whatsapp-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: max-content;
        min-width: 0;
        padding: 0 16px;
        white-space: nowrap;
      }

      .tm-footer__brand .tm-whatsapp-btn mat-icon {
        flex: 0 0 auto;
      }
      .tm-footer__tagline {
        font-size: 0.9rem;
        line-height: 1.6;
        margin: 0 0 20px;
        max-width: 360px;
        color: #9ba7b2;
      }
      .tm-footer__col h4 {
        color: #fff;
        margin: 0 0 16px;
        font-size: 1rem;
        font-weight: 600;
      }
      .tm-footer__col a {
        display: block;
        color: #9ba7b2;
        font-size: 0.9rem;
        padding: 5px 0;
        text-decoration: none;
      }
      .tm-footer__col a:hover {
        color: #fff;
        text-decoration: none;
      }
      .tm-footer__bar {
        border-top: 1px solid #2a3038;
        padding: 18px 0;
        font-size: 0.82rem;
        color: #7a8691;
      }

      /* Mobile nav */
      .mobile-nav {
        max-width: 300px;
        width: min(300px, 85vw);
        background: var(--tm-surface);
      }
      .mobile-nav__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid var(--tm-border);
      }
      .mobile-nav__search {
        padding: 12px 16px;
      }
      .mobile-nav__search-field {
        width: 100%;
      }
      .mobile-nav__title {
        font-weight: 700;
        font-size: 1.2rem;
      }
      .mobile-nav__divider {
        height: 1px;
        background: var(--tm-border);
        margin: 12px 16px;
      }
      .mobile-nav__cats-label {
        padding: 0 24px 8px;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--tm-text-muted);
        font-weight: 600;
      }
      .active-link {
        color: var(--tm-primary) !important;
        background: rgba(0, 121, 107, 0.08);
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .tm-header__nav {
          display: none;
        }
        .tm-header__search-field {
          width: 160px;
        }
      }
      @media (max-width: 860px) {
        .tm-footer__inner {
          grid-template-columns: 1fr 1fr;
        }
        .tm-footer__brand {
          grid-column: 1 / -1;
        }
      }
      @media (max-width: 720px) {
        .tm-header__search {
          display: none;
        }
        .tm-header__wa-label {
          display: none;
        }
        .tm-header__menu-btn {
          display: inline-flex;
        }
        .tm-header__wa {
          min-width: 0;
          padding: 0 12px;
        }
        .tm-header__inner {
          gap: 8px;
        }
      }
      @media (max-width: 560px) {
        .tm-footer__inner {
          grid-template-columns: 1fr;
          gap: 28px;
        }
        .tm-header_logo-img {
          width: 90px;
          max-height: auto;
        }
      }
      @media (max-width: 400px) {
        .tm-header__wa {
          display: none;
        }
        .tm-header__brand a {
          gap: 6px;
        }
      }
    `,
  ],
})
export class App {
  searchTerm = '';
  year = new Date().getFullYear();
  categories = signal<Category[]>([]);

  constructor(
    private products: ProductService,
    public whatsapp: WhatsAppService,
    private router: Router,
  ) {
    this.products.getCategories().subscribe((cats) => {
      this.categories.set(cats);
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim();
    if (term) {
      this.router.navigate(['/search'], {
        queryParams: { q: term },
      });
    }
  }
}
