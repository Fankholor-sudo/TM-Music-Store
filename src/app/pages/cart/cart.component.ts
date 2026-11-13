import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '@/app/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <div class="tm-container cart-page">
      <h1 class="cart-page__title">Shopping Cart</h1>
      @if (cart.totalItems() === 0) {
        <div class="cart-empty">
          <mat-icon>shopping_cart</mat-icon>
          <h2>Your cart is empty</h2>
          <p>Browse our shop and add some products to your cart.</p>
          <a mat-flat-button class="tm-primary-btn" routerLink="/shop">
            Browse Shop
          </a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cart.cartItems(); track item.product_id) {
              <article class="cart-row">
                <a [routerLink]="['/products', item.slug]" class="cart-row__img-link">
                  <img [src]="item.image_url" [alt]="item.name" class="cart-row__img" />
                </a>
                <div class="cart-row__info">
                  <div class="cart-row__brand">{{ item.brand }}</div>
                  <a [routerLink]="['/products', item.slug]" class="cart-row__name">
                    {{ item.name }}
                  </a>
                  <div class="cart-row__price">R{{ item.price.toFixed(2) }}</div>
                </div>
                <div class="cart-row__qty">
                  <button
                    mat-icon-button
                    class="qty-btn"
                    (click)="cart.decrement(item.product_id)"
                    aria-label="Decrease quantity"
                  >
                    <mat-icon>remove</mat-icon>
                  </button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button
                    mat-icon-button
                    class="qty-btn"
                    (click)="cart.increment(item.product_id)"
                    aria-label="Increase quantity"
                  >
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                <div class="cart-row__line-total">
                  R{{ (item.price * item.quantity).toFixed(2) }}
                </div>
                <button
                  mat-icon-button
                  class="cart-row__remove"
                  (click)="cart.removeItem(item.product_id)"
                  aria-label="Remove item"
                >
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </article>
            }
          </div>
          <aside class="cart-summary">
            <h2 class="cart-summary__title">Order Summary</h2>
            <div class="cart-summary__row">
              <span>Items</span>
              <span>{{ cart.totalItems() }}</span>
            </div>
            <div class="cart-summary__row">
              <span>Subtotal</span>
              <span>R{{ cart.subtotal().toFixed(2) }}</span>
            </div>
            <div class="cart-summary__row cart-summary__row--muted">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <mat-divider />
            <div class="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <span>R{{ cart.subtotal().toFixed(2) }}</span>
            </div>
            <a
              mat-flat-button
              class="tm-primary-btn cart-summary__checkout-btn"
              routerLink="/checkout"
            >
              Proceed to Checkout
            </a>
            <a
              mat-stroked-button
              class="tm-outline-btn cart-summary__continue-btn"
              routerLink="/shop"
            >
              Continue Shopping
            </a>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .cart-page {
        padding: 24px 24px 64px;
      }
      .cart-page__title {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 28px;
      }
      .cart-empty {
        text-align: center;
        padding: 80px 20px;
        color: var(--tm-text-muted);
      }
      .cart-empty mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 12px;
      }
      .cart-empty h2 {
        margin: 0 0 8px;
        color: var(--tm-text);
      }
      .cart-empty p {
        margin: 0 0 24px;
      }
      .cart-layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 28px;
        align-items: start;
      }
      .cart-items {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .cart-row {
        display: grid;
        grid-template-columns: 80px 1fr auto auto auto;
        gap: 16px;
        align-items: center;
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        padding: 16px;
      }
      .cart-row__img-link {
        display: block;
        width: 80px;
        height: 80px;
        border-radius: var(--tm-radius-sm);
        overflow: hidden;
        background: var(--tm-bg);
        flex-shrink: 0;
      }
      .cart-row__img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .cart-row__brand {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--tm-text-muted);
        margin-bottom: 2px;
      }
      .cart-row__name {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--tm-text);
        text-decoration: none;
        display: block;
        line-height: 1.3;
      }
      .cart-row__name:hover {
        color: var(--tm-primary);
      }
      .cart-row__price {
        font-size: 0.85rem;
        color: var(--tm-text-muted);
        margin-top: 4px;
      }
      .cart-row__qty {
        gap: 4px;
        display: flex;
        jusftify-content: center;
        align-items: center;
        background: var(--tm-bg);
        border-radius: var(--tm-radius-sm);
        padding: 2px;
      }
      .qty-btn mat-icon {
        width: 18px;
        height: 18px;
        font-size: 18px;
        line-height: 18px;
      }
      .qty-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }
      .qty-value {
        min-width: 28px;
        text-align: center;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .cart-row__line-total {
        font-weight: 700;
        font-size: 1rem;
        color: var(--tm-text);
        min-width: 80px;
        text-align: right;
      }
      .cart-row__remove {
        color: var(--tm-text-muted);
      }
      .cart-row__remove:hover {
        color: var(--tm-price);
      }
      .cart-summary {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        padding: 24px;
        position: sticky;
        top: 84px;
      }
      .cart-summary__title {
        font-size: 1.15rem;
        font-weight: 700;
        margin: 0 0 20px;
      }
      .cart-summary__row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.9rem;
        padding: 8px 0;
      }
      .cart-summary__row--muted {
        color: var(--tm-text-muted);
        font-size: 0.85rem;
      }
      .cart-summary__row--total {
        font-size: 1.1rem;
        font-weight: 700;
        padding-top: 12px;
      }
      .cart-summary__row--total span:last-child {
        color: var(--tm-price);
      }
      mat-divider {
        margin: 8px 0;
      }
      .cart-summary__checkout-btn {
        width: 100%;
        height: 48px;
        margin-top: 20px;
        font-size: 1rem;
        text-decoration: none;
      }
      .cart-summary__continue-btn {
        width: 100%;
        margin-top: 10px;
        text-decoration: none;
      }
      @media (max-width: 860px) {
        .cart-layout {
          grid-template-columns: 1fr;
        }
        .cart-summary {
          position: static;
        }
      }
      @media (max-width: 600px) {
        .cart-row {
          grid-template-columns: 64px 1fr;
          grid-template-rows: auto auto;
          gap: 12px;
        }
        .cart-row__img-link {
          width: 64px;
          height: 64px;
        }
        .cart-row__qty,
        .cart-row__line-total,
        .cart-row__remove {
          grid-column: 2;
        }
        .cart-row__qty {
          justify-self: start;
        }
        .cart-row__line-total {
          justify-self: end;
        }
        .cart-row__remove {
          justify-self: end;
        }
      }
    `,
  ],
})
export class CartComponent {
  cart = inject(CartService);
}