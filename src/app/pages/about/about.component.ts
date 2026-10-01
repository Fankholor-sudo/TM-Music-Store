import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WhatsAppService } from '../../services/whatsapp.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="about-hero">
      <div class="tm-container">
        <h1>About MusoHive</h1>
        <p>Your trusted source for quality music accessories at great prices.</p>
      </div>
    </section>

    <section class="tm-section">
      <div class="tm-container about-content">
        <div class="about-text">
          <h2>Our Story</h2>
          <p>
            MusoHive is an online store specialising in small music-related
            products and accessories. From in-ear monitors and audio cables to
            earphones, adapters, and connectors, we stock the gear that
            musicians, audio engineers, and music lovers rely on every day.
          </p>
          <p>
            We believe that finding the right accessory should be simple. That's
            why we've built a clean, fast catalogue you can browse from any
            device and order in minutes through WhatsApp. No complicated
            checkout, just pick what you need and message us.
          </p>
        </div>
        <div class="about-values">
          <div class="value-card">
            <mat-icon>verified</mat-icon>
            <h3>Quality First</h3>
            <p>We carefully select every product in our range.</p>
          </div>
          <div class="value-card">
            <mat-icon>sell</mat-icon>
            <h3>Fair Prices</h3>
            <p>Great value across our entire catalogue.</p>
          </div>
          <div class="value-card">
            <mat-icon>support_agent</mat-icon>
            <h3>Personal Service</h3>
            <p>Real people, ready to help on WhatsApp.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="tm-section cta-section">
      <div class="tm-container cta-inner">
        <h2>Ready to find your next accessory?</h2>
        <p>Browse our catalogue or reach out on WhatsApp.</p>
        <div class="cta-actions">
          <a mat-flat-button class="tm-primary-btn" routerLink="/shop">
            <mat-icon>storefront</mat-icon> Shop Products
          </a>
          <a
            mat-flat-button
            class="tm-whatsapp-btn"
            [href]="whatsapp.contactUrl()"
            target="_blank"
            rel="noopener"
          >
            <mat-icon>chat</mat-icon> Contact Us
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .about-hero {
        background: linear-gradient(135deg, var(--tm-primary-dark), var(--tm-primary));
        color: #fff;
        padding: 56px 0;
      }
      .about-hero h1 { font-size: 2.25rem; font-weight: 700; margin: 0 0 8px; }
      .about-hero p { font-size: 1.1rem; margin: 0; color: #b2dfdb; }
      .about-content {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 48px;
        align-items: start;
      }
      .about-text h2 { font-size: 1.4rem; margin: 0 0 14px; }
      .about-text p { color: var(--tm-text-muted); line-height: 1.7; margin: 0 0 16px; }
      .about-values { display: flex; flex-direction: column; gap: 16px; }
      .value-card {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
      .value-card mat-icon { color: var(--tm-primary); font-size: 1.75rem; width: 1.75rem; height: 1.75rem; }
      .value-card h3 { margin: 0; font-size: 1.05rem; }
      .value-card p { margin: 0; font-size: 0.88rem; color: var(--tm-text-muted); }
      .cta-section { background: var(--tm-surface); border-top: 1px solid var(--tm-border); }
      .cta-inner { text-align: center; }
      .cta-inner h2 { font-size: 1.6rem; margin: 0 0 8px; }
      .cta-inner p { color: var(--tm-text-muted); margin: 0 0 24px; }
      .cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      @media (max-width: 800px) {
        .about-content { grid-template-columns: 1fr; gap: 28px; }
        .about-hero h1 { font-size: 1.75rem; }
        .about-hero p { font-size: 1rem; }
      }
      @media (max-width: 480px) {
        .about-hero { padding: 40px 0; }
        .about-hero h1 { font-size: 1.5rem; }
        .cta-inner h2 { font-size: 1.3rem; }
        .cta-actions { flex-direction: column; }
        .cta-actions a { width: 100%; justify-content: center; }
      }
    `,
  ],
})
export class AboutComponent {
  whatsapp = inject(WhatsAppService);
}
