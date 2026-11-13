import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

import { CartService } from '@/app/services/cart.service';
import { PaystackService } from '@/app/services/paystack.service';
import { OrderService, CheckoutPayload } from '@/app/services/order.service';

interface PepStore {
  name: string;
  address: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDividerModule,
    MatProgressBarModule,
    MatCardModule,
    FormsModule,
  ],
  template: `
    <div class="tm-container checkout-page">
      <h1 class="checkout-page__title">Checkout</h1>

      @if (cart.totalItems() === 0 && !orderSuccess()) {
        <div class="checkout-empty">
          <mat-icon>shopping_cart</mat-icon>
          <h2>Your cart is empty</h2>
          <p>Add some products before checking out.</p>
          <a mat-flat-button class="tm-primary-btn" routerLink="/shop">
            Browse Shop
          </a>
        </div>
      } @else if (orderSuccess()) {
        <div class="checkout-success">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <h2>Order Confirmed!</h2>
          <p>
            Thank you for your purchase. A confirmation email has been sent to
            <strong>{{ successEmail() }}</strong>.
          </p>
          <div class="success-order-ref">
            Order Reference: <strong>{{ successReference() }}</strong>
          </div>
          <a mat-flat-button class="tm-primary-btn" routerLink="/shop">
            Continue Shopping
          </a>
        </div>
      } @else {
        <form (ngSubmit)="onSubmit()" #checkoutForm="ngForm">
          <div class="checkout-layout">
            <div class="checkout-form-side">
              <section class="checkout-section">
                <h2 class="checkout-section__title">
                  <span class="checkout-section__num">1</span>
                  Customer Details
                </h2>
                <div class="form-grid">
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>First Name</mat-label>
                    <input
                      matInput
                      name="firstName"
                      [(ngModel)]="firstName"
                      required
                      #firstNameInput="ngModel"
                    />
                    @if (firstNameInput.invalid && firstNameInput.touched) {
                      <mat-error>First name is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Last Name</mat-label>
                    <input
                      matInput
                      name="lastName"
                      [(ngModel)]="lastName"
                      required
                      #lastNameInput="ngModel"
                    />
                    @if (lastNameInput.invalid && lastNameInput.touched) {
                      <mat-error>Last name is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Email</mat-label>
                    <input
                      matInput
                      type="email"
                      name="email"
                      [(ngModel)]="email"
                      required
                      email
                      #emailInput="ngModel"
                    />
                    @if (emailInput.invalid && emailInput.touched) {
                      <mat-error>
                        {{ emailInput.errors?.['email'] ? 'Enter a valid email' : 'Email is required' }}
                      </mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Phone Number</mat-label>
                    <input
                      matInput
                      type="tel"
                      name="phone"
                      [(ngModel)]="phone"
                      required
                      placeholder="e.g. 0821234567"
                      #phoneInput="ngModel"
                    />
                    @if (phoneInput.invalid && phoneInput.touched) {
                      <mat-error>Phone number is required</mat-error>
                    }
                  </mat-form-field>
                </div>
              </section>

              <section class="checkout-section">
                <h2 class="checkout-section__title">
                  <span class="checkout-section__num">2</span>
                  Shipping Method
                </h2>
                <mat-radio-group
                  name="shippingMethod"
                  [(ngModel)]="shippingMethod"
                  class="shipping-radio-group"
                >
                  <mat-radio-button value="pep_store" class="shipping-radio">
                    <div class="shipping-option">
                      <div class="shipping-option__title">
                        Collect at a Pep-Store
                      </div>
                      <div class="shipping-option__desc">
                        Choose the nearest Pep-Store for collection. Free of charge.
                      </div>
                    </div>
                  </mat-radio-button>
                  <mat-radio-button value="door_delivery" class="shipping-radio">
                    <div class="shipping-option">
                      <div class="shipping-option__title">
                        Door Delivery
                      </div>
                      <div class="shipping-option__desc">
                        We deliver to your door. Enter your address or select your location on the map.
                      </div>
                    </div>
                  </mat-radio-button>
                </mat-radio-group>

                @if (shippingMethod === 'pep_store') {
                  <div class="shipping-details">
                    <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                      <mat-label>Select your nearest Pep-Store</mat-label>
                      <mat-select
                        name="pepStore"
                        [(ngModel)]="pepStoreLocation"
                        required
                        #pepStoreInput="ngModel"
                      >
                        @for (store of pepStores(); track store.name) {
                          <mat-option [value]="store.name">
                            {{ store.name }} — {{ store.address }}
                          </mat-option>
                        }
                      </mat-select>
                      @if (pepStoreInput.invalid && pepStoreInput.touched) {
                        <mat-error>Please select a Pep-Store</mat-error>
                      }
                    </mat-form-field>
                    <p class="shipping-note">
                      You will be notified when your order is ready for collection.
                    </p>
                  </div>
                }

                @if (shippingMethod === 'door_delivery') {
                  <div class="shipping-details">
                    <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                      <mat-label>Street Address</mat-label>
                      <textarea
                        matInput
                        name="deliveryAddress"
                        [(ngModel)]="deliveryAddress"
                        required
                        rows="1"
                        placeholder="House number, street name, suburb"
                        #addrInput="ngModel"
                      ></textarea>
                      @if (addrInput.invalid && addrInput.touched) {
                        <mat-error>Delivery address is required</mat-error>
                      }
                    </mat-form-field>
                    <div class="form-grid">
                      <mat-form-field appearance="outline" subscriptSizing="dynamic">
                        <mat-label>City</mat-label>
                        <input
                          matInput
                          name="deliveryCity"
                          [(ngModel)]="deliveryCity"
                          required
                          #cityInput="ngModel"
                        />
                        @if (cityInput.invalid && cityInput.touched) {
                          <mat-error>City is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline" subscriptSizing="dynamic">
                        <mat-label>Postal Code</mat-label>
                        <input
                          matInput
                          name="deliveryPostalCode"
                          [(ngModel)]="deliveryPostalCode"
                          required
                          #postalInput="ngModel"
                        />
                        @if (postalInput.invalid && postalInput.touched) {
                          <mat-error>Postal code is required</mat-error>
                        }
                      </mat-form-field>
                    </div>
                    <div class="map-section">
                      <div class="map-section__header">
                        <mat-icon>location_on</mat-icon>
                        <span>Select your location on the map</span>
                        <button
                          type="button"
                          mat-stroked-button
                          class="tm-outline-btn map-btn"
                          (click)="openMapPicker()"
                          disabled
                        >
                          <mat-icon>map</mat-icon> Open Map - Coming Soon
                        </button>
                      </div>
                      @if (mapLat() !== null && mapLng() !== null) {
                        <div class="map-coords">
                          Location selected: {{ mapLat()!.toFixed(5) }}, {{ mapLng()!.toFixed(5) }}
                          <button type="button" mat-button class="map-clear" (click)="clearMapLocation()">
                            <mat-icon>close</mat-icon> Clear
                          </button>
                        </div>
                      } @else {
                        <p class="map-hint">
                          Click "Open Map" to pin your exact location for easier delivery.
                        </p>
                      }
                      @if (showMap()) {
                        <div class="map-iframe-wrap">
                          <iframe
                            [src]="mapUrl()"
                            width="100%"
                            height="320"
                            style="border:0; border-radius: var(--tm-radius);"
                            loading="lazy"
                            allowfullscreen
                          ></iframe>
                          <button
                            type="button"
                            mat-stroked-button
                            class="tm-outline-btn map-done-btn"
                            (click)="closeMapPicker()"
                          >
                            Done
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </section>

              <section class="checkout-section">
                <h2 class="checkout-section__title">
                  <span class="checkout-section__num">3</span>
                  Payment
                </h2>
                <div class="payment-info">
                  <mat-icon class="payment-info__icon">lock</mat-icon>
                  <p>
                    You will be redirected to Paystack's secure payment page to
                    complete your purchase. Your payment is processed securely by
                    Paystack — we never see your card details.
                  </p>
                </div>
              </section>
            </div>

            <aside class="checkout-summary">
              <h2 class="checkout-summary__title">Order Summary</h2>
              <div class="checkout-summary__items">
                @for (item of cart.cartItems(); track item.product_id) {
                  <div class="summary-item">
                    <img [src]="item.image_url" [alt]="item.name" class="summary-item__img" />
                    <div class="summary-item__info">
                      <div class="summary-item__name">{{ item.name }}</div>
                      <div class="summary-item__qty">Qty: {{ item.quantity }}</div>
                    </div>
                    <div class="summary-item__price">
                      R{{ (item.price * item.quantity).toFixed(2) }}
                    </div>
                  </div>
                }
              </div>
              <mat-divider />
              <div class="checkout-summary__row">
                <span>Subtotal</span>
                <span>R{{ cart.subtotal().toFixed(2) }}</span>
              </div>
              <div class="checkout-summary__row">
                <span>Shipping</span>
                <span>R{{ shippingCost().toFixed(2) }}</span>
              </div>
              <mat-divider />
              <div class="checkout-summary__row checkout-summary__row--total">
                <span>Total</span>
                <span>R{{ total().toFixed(2) }}</span>
              </div>
              <button
                mat-flat-button
                [class]="checkoutForm.invalid || processing()? 'tm-secondary-btn' : 'tm-primary-btn'"
                class="checkout-summary__pay-btn"
                type="submit"
                [disabled]="checkoutForm.invalid || processing()"
              >
                @if (processing()) {
                  <ng-container><mat-icon class="spin">sync</mat-icon> Processing...</ng-container>
                } @else {
                  <ng-container><mat-icon>lock</mat-icon> R{{ total().toFixed(2) }}</ng-container>
                }
              </button>
              @if (errorMessage()) {
                <div class="checkout-error">
                  <mat-icon>error_outline</mat-icon>
                  {{ errorMessage() }}
                </div>
              }
            </aside>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .checkout-page {
        padding: 24px 24px 64px;
      }
      .checkout-page__title {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 28px;
      }
      .checkout-empty,
      .checkout-success {
        text-align: center;
        padding: 80px 20px;
        color: var(--tm-text-muted);
      }
      .checkout-empty mat-icon,
      .checkout-success .success-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 12px;
      }
      .checkout-success .success-icon {
        color: var(--tm-primary);
      }
      .checkout-success h2 {
        color: var(--tm-text);
        margin: 0 0 12px;
      }
      .checkout-success p {
        margin: 0 0 16px;
        max-width: 420px;
        margin-left: auto;
        margin-right: auto;
      }
      .success-order-ref {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        padding: 16px 24px;
        margin-bottom: 24px;
        display: inline-block;
        font-size: 0.95rem;
      }
      .success-order-ref strong {
        color: var(--tm-primary);
      }
      .checkout-layout {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 28px;
        align-items: start;
      }
      .checkout-form-side {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .checkout-section {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        padding: 24px;
      }
      .checkout-section__title {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0 0 20px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .checkout-section__num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--tm-primary);
        color: #fff;
        font-size: 0.8rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      .form-grid {
        display: grid;
        margin-top: 12px;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .full-width {
        width: 100%;
      }
      .shipping-radio-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .shipping-radio {
        display: flex;
        align-items: flex-start;
      }
      .shipping-option {
        padding: 4px 0;
      }
      .shipping-option__title {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--tm-text);
      }
      .shipping-option__desc {
        font-size: 0.85rem;
        color: var(--tm-text-muted);
        margin-top: 2px;
      }
      .shipping-details {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid var(--tm-border);
      }
      .shipping-note {
        font-size: 0.85rem;
        color: var(--tm-text-muted);
        margin: 8px 0 0;
      }
      .map-section {
        margin-top: 16px;
      }
      .map-section__header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--tm-text);
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      .map-section__header mat-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
        color: var(--tm-primary);
      }
      .map-btn {
        height: 32px;
        font-size: 0.8rem;
        margin-left: auto;
      }
      .map-coords {
        background: rgba(0, 121, 107, 0.06);
        border: 1px solid rgba(0, 121, 107, 0.2);
        border-radius: var(--tm-radius-sm);
        padding: 10px 14px;
        font-size: 0.85rem;
        color: var(--tm-primary-dark);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .map-clear {
        height: 28px;
        padding: 0 8px;
        font-size: 0.8rem;
        color: var(--tm-text-muted);
      }
      .map-hint {
        font-size: 0.85rem;
        color: var(--tm-text-muted);
        margin: 4px 0 0;
      }
      .map-iframe-wrap {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .map-done-btn {
        align-self: flex-start;
      }
      .payment-info {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: var(--tm-bg);
        border-radius: var(--tm-radius-sm);
        padding: 16px;
      }
      .payment-info__icon {
        color: var(--tm-primary);
        flex-shrink: 0;
        margin-top: 2px;
      }
      .payment-info p {
        margin: 0;
        font-size: 0.88rem;
        line-height: 1.5;
        color: var(--tm-text-muted);
      }
      .checkout-error {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #fce8e6;
        border-radius: var(--tm-radius-sm);
        padding: 12px 16px;
        margin-top: 16px;
        color: #c5221f;
        font-size: 0.9rem;
      }
      .checkout-error mat-icon {
        flex-shrink: 0;
      }
      .checkout-summary {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        padding: 24px;
        position: sticky;
        top: 84px;
      }
      .checkout-summary__title {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0 0 16px;
      }
      .checkout-summary__items {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
        max-height: 280px;
        overflow-y: auto;
      }
      .summary-item {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .summary-item__img {
        width: 48px;
        height: 48px;
        border-radius: var(--tm-radius-sm);
        object-fit: contain;
        background: var(--tm-bg);
        flex-shrink: 0;
      }
      .summary-item__info {
        flex: 1;
        min-width: 0;
      }
      .summary-item__name {
        font-size: 0.85rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .summary-item__qty {
        font-size: 0.8rem;
        color: var(--tm-text-muted);
      }
      .summary-item__price {
        font-weight: 700;
        font-size: 0.88rem;
        flex-shrink: 0;
      }
      .checkout-summary__row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 0.9rem;
      }
      .checkout-summary__row--total {
        font-size: 1.1rem;
        font-weight: 700;
        padding-top: 12px;
      }
      .checkout-summary__row--total span:last-child {
        color: var(--tm-price);
      }
      .checkout-summary__pay-btn {
        width: 100%;
        height: 50px;
        margin-top: 20px;
        font-size: 1.5rem;
        font-weight: 400;
      }
      .checkout-summary__pay-btn mat-icon {
        height: 22px;
        font-size: 18px;
        display: inline-flex;
        vertical-align: middle;
      }
      .spin {
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        100% { transform: rotate(360deg); }
      }
      mat-divider {
        margin: 4px 0;
      }
      @media (max-width: 860px) {
        .checkout-layout {
          grid-template-columns: 1fr;
        }
        .checkout-summary {
          position: static;
          order: -1;
        }
      }
      @media (max-width: 600px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .checkout-section {
          padding: 16px;
        }
      }
    `,
  ],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart = inject(CartService);
  private paystack = inject(PaystackService);
  private orders = inject(OrderService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';

  shippingMethod: 'pep_store' | 'door_delivery' = 'pep_store';
  pepStoreLocation = '';
  deliveryAddress = '';
  deliveryCity = '';
  deliveryPostalCode = '';
  mapLat = signal<number | null>(null);
  mapLng = signal<number | null>(null);
  showMap = signal(false);

  processing = signal(false);
  errorMessage = signal('');
  orderSuccess = signal(false);
  successEmail = signal('');
  successReference = signal('');

  pepStores = signal<PepStore[]>([
    { name: 'Pep-Store Cape Town CBD', address: '123 Long Street, Cape Town' },
    { name: 'Pep-Store Johannesburg CBD', address: '45 Eloff Street, Johannesburg' },
    { name: 'Pep-Store Durban Central', address: '78 West Street, Durban' },
    { name: 'Pep-Store Pretoria CBD', address: '12 Church Street, Pretoria' },
    { name: 'Pep-Store Port Elizabeth', address: '34 Main Road, Port Elizabeth' },
    { name: 'Pep-Store Bloemfontein', address: '56 Kerk Street, Bloemfontein' },
  ]);

  shippingCost = computed(() =>
    this.shippingMethod === 'door_delivery' ? 80 : 0,
  );
  total = computed(() => this.cart.subtotal() + this.shippingCost());

  mapUrl = computed(() => {
    const lat = this.mapLat() ?? -29.0;
    const lng = this.mapLng() ?? 24.0;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02},${lat - 0.02},${lng + 0.02},${lat + 0.02}&layer=mapnik&marker=${lat},${lng}`;
  });

  private messageListener = (event: MessageEvent) => {
    if (event.data?.type === 'map-location' && event.data.lat && event.data.lng) {
      this.mapLat.set(event.data.lat);
      this.mapLng.set(event.data.lng);
      this.showMap.set(false);
    }
  };

  ngOnInit(): void {
    window.addEventListener('message', this.messageListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageListener);
  }

  openMapPicker(): void {
    this.showMap.set(true);
  }

  closeMapPicker(): void {
    this.showMap.set(false);
  }

  clearMapLocation(): void {
    this.mapLat.set(null);
    this.mapLng.set(null);
  }

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');

    if (this.shippingMethod === 'pep_store' && !this.pepStoreLocation) {
      this.errorMessage.set('Please select a Pep-Store location for collection.');
      return;
    }
    if (this.shippingMethod === 'door_delivery') {
      if (!this.deliveryAddress || !this.deliveryCity || !this.deliveryPostalCode) {
        this.errorMessage.set('Please fill in all delivery address fields.');
        return;
      }
    }

    const reference = this.paystack.generateReference();
    this.processing.set(true);

    try {
      await this.paystack.pay({
        email: this.email,
        amount: this.total(),
        reference,
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        callbacks: {
          onSuccess: async (paystackRef: string) => {
            await this.processOrder(reference, paystackRef);
          },
          onClose: () => {
            this.processing.set(false);
            this.errorMessage.set(
              'Payment window was closed. Your order was not completed.',
            );
          },
        },
      });
    } catch (err) {
      this.processing.set(false);
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Payment failed. Please try again.',
      );
    }
  }

  private async processOrder(reference: string, paystackRef: string): Promise<void> {
    const payload: CheckoutPayload = {
      reference,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      phone: this.phone,
      shipping_method: this.shippingMethod,
      pep_store_location: this.shippingMethod === 'pep_store' ? this.pepStoreLocation : null,
      delivery_address: this.shippingMethod === 'door_delivery' ? this.deliveryAddress : null,
      delivery_city: this.shippingMethod === 'door_delivery' ? this.deliveryCity : null,
      delivery_postal_code: this.shippingMethod === 'door_delivery' ? this.deliveryPostalCode : null,
      delivery_latitude: this.mapLat(),
      delivery_longitude: this.mapLng(),
      subtotal: this.cart.subtotal(),
      shipping_cost: this.shippingCost(),
      total: this.total(),
      items: this.cart.cartItems().map((item) => ({
        ...item,
        product_name: item.name,
        product_image: item.image_url,
        unit_price: item.price,
        line_total: item.price * item.quantity,
      })),
    };

    try {
      const result = await this.orders.verifyAndSaveOrder(payload);
      this.processing.set(false);

      if (result.success) {
        this.cart.clearCart();
        this.orderSuccess.set(true);
        this.successEmail.set(this.email);
        this.successReference.set(reference);
      } else {
        this.errorMessage.set(
          result.error || 'Order could not be saved. Please contact support.',
        );
      }
    } catch (err) {
      this.processing.set(false);
      this.errorMessage.set(
        err instanceof Error
          ? err.message
          : 'Something went wrong saving your order. Please contact support.',
      );
    }
  }
}