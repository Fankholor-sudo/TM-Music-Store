import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { WhatsAppService } from "@/app/services/whatsapp.service";

@Component({
  selector: "app-about",
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="about-hero">
      <div class="tm-container hero-inner">
        <span class="hero-eyebrow">
          <mat-icon>graphic_eq</mat-icon>
          ABOUT MUSOHIVE
        </span>

        <h1>Everything you need to stay connected to your sound.</h1>

        <p>
          Quality music and audio accessories for musicians, audio enthusiasts
          and anyone who appreciates great sound.
        </p>

        <a mat-flat-button class="hero-button" routerLink="/shop">
          Explore Our Products
          <mat-icon>arrow_forward</mat-icon>
        </a>
      </div>
    </section>

    <!-- Our Story -->
    <section class="tm-section story-section">
      <div class="tm-container story-grid">
        <div class="story-content">
          <span class="section-eyebrow">WHO WE ARE</span>
          <h2>Our Story</h2>

          <p>
            MusoHive is an online store specialising in music-related products
            and audio accessories. We bring together practical essentials such
            as in-ear monitors, earphones, audio cables, adapters and connectors
            in one convenient place.
          </p>

          <p>
            Whether you're a musician preparing for a performance, an audio
            enthusiast upgrading your setup, or simply looking for a reliable
            accessory, we're here to make finding what you need easier.
          </p>

          <p>
            We believe shopping for music accessories should be straightforward.
            That's why we've created a simple online shopping experience where
            you can explore our catalogue, discover products and place your
            order with confidence.
          </p>
        </div>

        <div class="story-highlight">
          <div class="highlight-icon">
            <mat-icon>headphones</mat-icon>
          </div>

          <h3>Made for your sound.</h3>

          <p>
            From everyday listening to music production and live performance,
            the right accessories help bring your audio experience together.
          </p>

          <div class="highlight-decoration">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission -->
    <section class="mission-section">
      <div class="tm-container mission-inner">
        <div class="mission-icon">
          <mat-icon>track_changes</mat-icon>
        </div>

        <span class="section-eyebrow">OUR MISSION</span>

        <h2>Making quality audio accessories easier to find.</h2>

        <p>
          Our goal is to provide a convenient place to discover useful music and
          audio accessories, with a straightforward ordering process and helpful
          customer support along the way.
        </p>
      </div>
    </section>

    <!-- Values -->
    <section class="tm-section values-section">
      <div class="tm-container">
        <div class="section-heading">
          <span class="section-eyebrow">THE MUSOHIVE DIFFERENCE</span>
          <h2>Why shop with MusoHive?</h2>
          <p>
            We focus on the things that make shopping for audio accessories
            easier and more convenient.
          </p>
        </div>

        <div class="values-grid">
          <article class="value-card">
            <div class="value-icon">
              <mat-icon>verified</mat-icon>
            </div>
            <h3>Quality-Focused Selection</h3>
            <p>
              We focus on music and audio accessories selected to serve
              practical everyday needs.
            </p>
          </article>

          <article class="value-card">
            <div class="value-icon">
              <mat-icon>sell</mat-icon>
            </div>
            <h3>Value for Money</h3>
            <p>
              Explore a range of useful accessories at prices designed to offer
              great value.
            </p>
          </article>

          <article class="value-card">
            <div class="value-icon">
              <mat-icon>shopping_bag</mat-icon>
            </div>
            <h3>Convenient Shopping</h3>
            <p>
              Browse our online catalogue, find what you need and place your
              order through our convenient checkout.
            </p>
          </article>

          <article class="value-card">
            <div class="value-icon">
              <mat-icon>support_agent</mat-icon>
            </div>
            <h3>Personal Support</h3>
            <p>
              Have a question about a product or order? Our team is available to
              assist you.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Shopping Experience -->
    <section class="tm-section shopping-section">
      <div class="tm-container shopping-grid">
        <div class="shopping-content">
          <span class="section-eyebrow">SHOP WITH EASE</span>
          <h2>A simple way to find what you need.</h2>

          <p>
            We've designed MusoHive to make discovering and ordering music
            accessories as straightforward as possible.
          </p>

          <div class="shopping-step">
            <div class="step-number">01</div>
            <div>
              <h3>Explore the catalogue</h3>
              <p>
                Browse our products and find the accessories you're looking for.
              </p>
            </div>
          </div>

          <div class="shopping-step">
            <div class="step-number">02</div>
            <div>
              <h3>Place your order</h3>
              <p>Complete your order through our online checkout.</p>
            </div>
          </div>

          <div class="shopping-step">
            <div class="step-number">03</div>
            <div>
              <h3>Get your order delivered</h3>
              <p>
                We'll process your order and arrange delivery to your location.
              </p>
            </div>
          </div>
        </div>

        <div class="shopping-card">
          <div class="shopping-card-icon">
            <mat-icon>graphic_eq</mat-icon>
          </div>

          <span>YOUR SOUND. YOUR SETUP.</span>

          <h3>Find the accessories that complete your setup.</h3>

          <p>
            Discover in-ear monitors, earphones, cables, adapters and more at
            MusoHive.
          </p>

          <a routerLink="/shop" class="text-link">
            Browse the shop
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="tm-container cta-inner">
        <div class="cta-icon">
          <mat-icon>headphones</mat-icon>
        </div>

        <h2>Let's find what your setup needs.</h2>

        <p>
          Explore our collection of music and audio accessories or get in touch
          if you need assistance.
        </p>

        <div class="cta-actions">
          <a mat-flat-button class="tm-primary-btn" routerLink="/shop">
            <mat-icon>storefront</mat-icon>
            Shop Products
          </a>

          <a
            mat-flat-button
            class="tm-whatsapp-btn"
            [href]="whatsapp.contactUrl()"
            target="_blank"
            rel="noopener"
          >
            <mat-icon>chat</mat-icon>
            Contact Us
          </a>
        </div>
      </div>
    </section>
  `,

  styles: [
    `
      /* HERO */
      .about-hero {
        position: relative;
        overflow: hidden;
        background:
          radial-gradient(
            circle at 85% 20%,
            rgba(255, 255, 255, 0.1),
            transparent 28%
          ),
          linear-gradient(135deg, var(--tm-primary-dark), var(--tm-primary));
        color: #fff;
        padding: 76px 0 82px;
      }

      .hero-inner {
        position: relative;
        z-index: 1;
        max-width: 900px;
      }

      .hero-eyebrow,
      .section-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 1.5px;
      }

      .hero-eyebrow {
        color: #b2dfdb;
        margin-bottom: 20px;
      }

      .hero-eyebrow mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .about-hero h1 {
        max-width: 760px;
        font-size: clamp(2.2rem, 5vw, 3.6rem);
        font-weight: 800;
        line-height: 1.13;
        letter-spacing: -1.5px;
        margin: 0 0 20px;
      }

      .about-hero p {
        max-width: 620px;
        color: #d8eeeb;
        font-size: 1.08rem;
        line-height: 1.75;
        margin: 0 0 30px;
      }

      .hero-button {
        background: #fff !important;
        color: var(--tm-primary-dark) !important;
        font-weight: 700;
        min-height: 46px;
        padding: 0 20px;
        border-radius: 8px;
      }

      .hero-button mat-icon {
        margin-left: 8px;
      }

      /* STORY */
      .story-grid {
        display: grid;
        grid-template-columns: 1.35fr 0.85fr;
        gap: 64px;
        align-items: center;
      }

      .section-eyebrow {
        color: var(--tm-primary);
        margin-bottom: 12px;
      }

      .story-content h2,
      .shopping-content h2 {
        font-size: 2rem;
        font-weight: 750;
        letter-spacing: -0.5px;
        margin: 0 0 20px;
      }

      .story-content p,
      .shopping-content > p {
        color: var(--tm-text-muted);
        font-size: 0.97rem;
        line-height: 1.85;
        margin: 0 0 16px;
      }

      .story-highlight {
        position: relative;
        overflow: hidden;
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: 18px;
        padding: 36px;
        min-height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .highlight-icon {
        width: 64px;
        height: 64px;
        display: grid;
        place-items: center;
        border-radius: 16px;
        background: color-mix(in srgb, var(--tm-primary) 12%, transparent);
        color: var(--tm-primary);
        margin-bottom: 22px;
      }

      .highlight-icon mat-icon {
        font-size: 34px;
        width: 34px;
        height: 34px;
      }

      .story-highlight h3 {
        font-size: 1.45rem;
        margin: 0 0 12px;
      }

      .story-highlight p {
        color: var(--tm-text-muted);
        line-height: 1.7;
        margin: 0;
        max-width: 340px;
      }

      .highlight-decoration {
        position: absolute;
        right: 28px;
        bottom: 25px;
        height: 65px;
        display: flex;
        align-items: center;
        gap: 5px;
        opacity: 0.35;
      }

      .highlight-decoration span {
        width: 5px;
        border-radius: 5px;
        background: var(--tm-primary);
      }

      .highlight-decoration span:nth-child(1),
      .highlight-decoration span:nth-child(7) {
        height: 18px;
      }
      .highlight-decoration span:nth-child(2),
      .highlight-decoration span:nth-child(6) {
        height: 34px;
      }
      .highlight-decoration span:nth-child(3),
      .highlight-decoration span:nth-child(5) {
        height: 48px;
      }
      .highlight-decoration span:nth-child(4) {
        height: 65px;
      }

      /* MISSION */
      .mission-section {
        background: color-mix(in srgb, var(--tm-primary) 7%, var(--tm-surface));
        border-top: 1px solid var(--tm-border);
        border-bottom: 1px solid var(--tm-border);
        padding: 64px 0;
        text-align: center;
      }

      .mission-inner {
        max-width: 760px;
      }

      .mission-icon {
        width: 58px;
        height: 58px;
        display: grid;
        place-items: center;
        margin: 0 auto 20px;
        background: var(--tm-surface);
        color: var(--tm-primary);
        border-radius: 16px;
        border: 1px solid var(--tm-border);
      }

      .mission-icon mat-icon {
        font-size: 30px;
        width: 30px;
        height: 30px;
      }

      .mission-inner h2 {
        font-size: clamp(1.65rem, 3vw, 2.3rem);
        font-weight: 750;
        line-height: 1.25;
        margin: 0 0 16px;
      }

      .mission-inner > p {
        color: var(--tm-text-muted);
        line-height: 1.8;
        font-size: 1rem;
        margin: 0;
      }

      /* VALUES */
      .section-heading {
        text-align: center;
        max-width: 650px;
        margin: 0 auto 38px;
      }

      .section-heading h2 {
        font-size: 2rem;
        font-weight: 750;
        margin: 0 0 12px;
      }

      .section-heading p {
        color: var(--tm-text-muted);
        line-height: 1.7;
        margin: 0;
      }

      .values-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
      }

      .value-card {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: 14px;
        padding: 25px 22px;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }

      .value-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
      }

      .value-icon {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: color-mix(in srgb, var(--tm-primary) 10%, transparent);
        color: var(--tm-primary);
        margin-bottom: 18px;
      }

      .value-icon mat-icon {
        font-size: 25px;
        width: 25px;
        height: 25px;
      }

      .value-card h3 {
        font-size: 1.02rem;
        font-weight: 700;
        line-height: 1.4;
        margin: 0 0 10px;
      }

      .value-card p {
        color: var(--tm-text-muted);
        font-size: 0.88rem;
        line-height: 1.7;
        margin: 0;
      }

      /* SHOPPING */
      .shopping-section {
        background: var(--tm-surface);
        border-top: 1px solid var(--tm-border);
      }

      .shopping-grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 64px;
        align-items: center;
      }

      .shopping-content h2 {
        max-width: 480px;
      }

      .shopping-step {
        display: flex;
        gap: 16px;
        margin-top: 25px;
      }

      .step-number {
        flex-shrink: 0;
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: color-mix(in srgb, var(--tm-primary) 10%, transparent);
        color: var(--tm-primary);
        font-weight: 800;
        font-size: 0.85rem;
      }

      .shopping-step h3 {
        font-size: 1rem;
        margin: 0 0 5px;
      }

      .shopping-step p {
        color: var(--tm-text-muted);
        font-size: 0.88rem;
        line-height: 1.6;
        margin: 0;
      }

      .shopping-card {
        background: linear-gradient(
          145deg,
          var(--tm-primary-dark),
          var(--tm-primary)
        );
        color: #fff;
        border-radius: 18px;
        padding: 38px;
      }

      .shopping-card-icon {
        width: 60px;
        height: 60px;
        display: grid;
        place-items: center;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.13);
        margin-bottom: 28px;
      }

      .shopping-card-icon mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .shopping-card > span {
        color: #b2dfdb;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 1.5px;
      }

      .shopping-card h3 {
        font-size: 1.7rem;
        line-height: 1.3;
        margin: 12px 0;
      }

      .shopping-card p {
        color: #d8eeeb;
        line-height: 1.7;
        font-size: 0.92rem;
        margin: 0 0 24px;
      }

      .text-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #fff;
        font-weight: 700;
        text-decoration: none;
      }

      .text-link:hover {
        text-decoration: underline;
      }

      /* CTA */
      .cta-section {
        background: var(--tm-surface);
        border-top: 1px solid var(--tm-border);
        padding: 65px 0;
      }

      .cta-inner {
        text-align: center;
        max-width: 700px;
      }

      .cta-icon {
        width: 58px;
        height: 58px;
        display: grid;
        place-items: center;
        margin: 0 auto 20px;
        color: var(--tm-primary);
        background: color-mix(in srgb, var(--tm-primary) 10%, transparent);
        border-radius: 16px;
      }

      .cta-icon mat-icon {
        font-size: 30px;
        width: 30px;
        height: 30px;
      }

      .cta-inner h2 {
        font-size: 2rem;
        font-weight: 750;
        margin: 0 0 12px;
      }

      .cta-inner > p {
        color: var(--tm-text-muted);
        line-height: 1.7;
        margin: 0 0 26px;
      }

      .cta-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .cta-actions a {
        min-height: 46px;
        padding: 0 20px;
        border-radius: 8px;
      }

      /* RESPONSIVE */
      @media (max-width: 1000px) {
        .values-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .story-grid,
        .shopping-grid {
          gap: 36px;
        }
      }

      @media (max-width: 800px) {
        .about-hero {
          padding: 60px 0;
        }

        .story-grid,
        .shopping-grid {
          grid-template-columns: 1fr;
        }

        .story-highlight {
          min-height: 250px;
        }

        .shopping-card {
          padding: 30px;
        }
      }

      @media (max-width: 480px) {
        .about-hero {
          padding: 48px 0;
        }

        .about-hero h1 {
          letter-spacing: -0.8px;
        }

        .values-grid {
          grid-template-columns: 1fr;
        }

        .story-content h2,
        .shopping-content h2,
        .section-heading h2,
        .cta-inner h2 {
          font-size: 1.55rem;
        }

        .story-highlight {
          padding: 26px;
        }

        .cta-actions {
          flex-direction: column;
        }

        .cta-actions a {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
})
export class AboutComponent {
  whatsapp = inject(WhatsAppService);
}
