import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { WhatsAppService } from '../../services/whatsapp.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <section class="contact-hero">
      <div class="tm-container">
        <h1>Contact MusoHive</h1>
        <p>We're here to help. Reach out and we'll get back to you on WhatsApp.</p>
      </div>
    </section>

    <section class="tm-section">
      <div class="tm-container contact-grid">
        <div class="contact-cards">
          <mat-card class="contact-card">
            <mat-icon class="contact-card__icon">chat</mat-icon>
            <h3>WhatsApp</h3>
            <p>The fastest way to reach us. Send a message and we'll reply during business hours.</p>
            <a
              mat-flat-button
              class="tm-whatsapp-btn"
              [href]="whatsapp.contactUrl()"
              target="_blank"
              rel="noopener"
            >
              <mat-icon>chat</mat-icon> Chat on WhatsApp
            </a>
          </mat-card>

          <mat-card class="contact-card">
            <mat-icon class="contact-card__icon">storefront</mat-icon>
            <h3>Browse Products</h3>
            <p>Looking for something specific? Browse our full catalogue of music accessories.</p>
            <a mat-stroked-button class="tm-outline-btn" routerLink="/shop">
              <mat-icon>storefront</mat-icon> View Shop
            </a>
          </mat-card>

          <mat-card class="contact-card">
            <mat-icon class="contact-card__icon">access_time</mat-icon>
            <h3>Business Hours</h3>
            <p>Monday – Friday: 9:00 – 17:00<br />Saturday: 9:00 – 13:00<br />Sunday: Closed</p>
          </mat-card>
        </div>

        <div class="contact-info-panel">
          <h2>How to Order</h2>
          <ol class="order-steps">
            <li>
              <span class="step-num">1</span>
              <div>
                <strong>Browse</strong>
                <p>Explore our catalogue and find the product you need.</p>
              </div>
            </li>
            <li>
              <span class="step-num">2</span>
              <div>
                <strong>View Details</strong>
                <p>Check the specs, price, and availability on the product page.</p>
              </div>
            </li>
            <li>
              <span class="step-num">3</span>
              <div>
                <strong>Order on WhatsApp</strong>
                <p>Click the "Order on WhatsApp" button — your message is pre-filled with product details and a link.</p>
              </div>
            </li>
            <li>
              <span class="step-num">4</span>
              <div>
                <strong>We Handle the Rest</strong>
                <p>We confirm availability, arrange delivery or collection, and take payment.</p>
              </div>
            </li>
          </ol>
          <a
            mat-flat-button
            class="tm-whatsapp-btn full-width"
            [href]="whatsapp.contactUrl()"
            target="_blank"
            rel="noopener"
          >
            <mat-icon>chat</mat-icon> Start a Conversation
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .contact-hero {
        background: linear-gradient(135deg, var(--tm-primary-dark), var(--tm-primary));
        color: #fff;
        padding: 56px 0;
      }
      .contact-hero h1 { font-size: 2.25rem; font-weight: 700; margin: 0 0 8px; }
      .contact-hero p { font-size: 1.1rem; margin: 0; color: #b2dfdb; }
      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        align-items: start;
      }
      .contact-cards { display: flex; flex-direction: column; gap: 16px; }
      .contact-card {
        padding: 24px !important;
        border-radius: var(--tm-radius) !important;
      }
      .contact-card__icon {
        color: var(--tm-primary);
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        margin-bottom: 10px;
      }
      .contact-card h3 { margin: 0 0 8px; font-size: 1.1rem; }
      .contact-card p { margin: 0 0 16px; color: var(--tm-text-muted); font-size: 0.9rem; line-height: 1.6; }
      .contact-info-panel {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        padding: 32px;
      }
      .contact-info-panel h2 { margin: 0 0 20px; font-size: 1.4rem; }
      .order-steps { list-style: none; padding: 0; margin: 0 0 24px; }
      .order-steps li {
        display: flex;
        gap: 14px;
        margin-bottom: 20px;
      }
      .step-num {
        flex-shrink: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--tm-primary);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.85rem;
      }
      .order-steps strong { font-size: 0.98rem; }
      .order-steps p { margin: 2px 0 0; font-size: 0.85rem; color: var(--tm-text-muted); }
      .full-width { width: 100%; }
      @media (max-width: 800px) {
        .contact-grid { grid-template-columns: 1fr; }
        .contact-hero h1 { font-size: 1.75rem; }
        .contact-hero p { font-size: 1rem; }
      }
      @media (max-width: 480px) {
        .contact-hero { padding: 40px 0; }
        .contact-hero h1 { font-size: 1.5rem; }
        .contact-info-panel { padding: 24px 20px; }
        .contact-card { padding: 20px !important; }
      }
    `,
  ],
})
export class ContactComponent {
  whatsapp = inject(WhatsAppService);
}
