import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WhatsAppService } from '@/app/services/whatsapp.service';
import { SupabaseService } from '@/app/services/supabase.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <section class="contact-hero">
      <div class="tm-container contact-hero__inner">
        <span class="hero-eyebrow">
          <mat-icon>headset_mic</mat-icon>
          WE'RE HERE TO HELP
        </span>

        <h1>Let's talk.</h1>

        <p>
          Have a question about a product, an order or anything else?
          We'd love to hear from you.
        </p>

        <div class="hero-links">
          <a [href]="whatsapp.contactUrl()" target="_blank" rel="noopener">
            <mat-icon>chat</mat-icon>
            Chat with us
          </a>

          <a href="mailto:info@musohive.co.za">
            <mat-icon>mail</mat-icon>
            Send us an email
          </a>
        </div>
      </div>
    </section>

    <section class="tm-section contact-section">
      <div class="tm-container">

        <div class="section-heading">
          <span>GET IN TOUCH</span>
          <h2>How can we help you?</h2>
          <p>Choose the contact method that works best for you.</p>
        </div>

        <div class="contact-methods">

          <!-- WhatsApp -->
          <article class="contact-method">
            <div class="method-icon whatsapp-icon">
              <mat-icon>chat</mat-icon>
            </div>

            <h3>WhatsApp</h3>

            <p>
              Need a quick answer? Send us a WhatsApp message and
              we'll be happy to assist.
            </p>

            <a
              [href]="whatsapp.contactUrl()"
              target="_blank"
              rel="noopener"
              class="method-link"
            >
              Chat on WhatsApp
              <mat-icon>arrow_forward</mat-icon>
            </a>
          </article>

          <!-- Email -->
          <article class="contact-method">
            <div class="method-icon email-icon">
              <mat-icon>mail_outline</mat-icon>
            </div>

            <h3>Email</h3>

            <p>
              Prefer email? Send us your enquiry and we'll get
              back to you.
            </p>

            <a
              href="mailto:info@musohive.co.za"
              class="method-link"
            >
              info@musohive.co.za
              <mat-icon>arrow_forward</mat-icon>
            </a>
          </article>

          <!-- Business hours -->
          <article class="contact-method">
            <div class="method-icon hours-icon">
              <mat-icon>schedule</mat-icon>
            </div>

            <h3>Business Hours</h3>

            <p>
              Monday – Friday: 09:00 – 17:00<br />
              Saturday: 09:00 – 13:00<br />
              Sunday: Closed
            </p>

            <span class="method-note">
              We aim to respond during business hours.
            </span>
          </article>

        </div>

        <!-- Contact form and information -->
        <div class="contact-main-grid">

          <div class="contact-form-panel">
            <div class="form-heading">
              <div>
                <span class="form-eyebrow">SEND US A MESSAGE</span>
                <h2>Drop us a line</h2>
                <p>
                  Fill in the form below and your message will be
                  sent directly to our team.
                </p>
              </div>

              <div class="form-heading-icon">
                <mat-icon>mark_email_unread</mat-icon>
              </div>
            </div>

            <form
              class="contact-form"
              (ngSubmit)="submitForm()"
              #contactForm="ngForm"
            >

              <div class="form-row">
                <div class="form-field">
                  <label for="contact-name">Your name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    [(ngModel)]="form.name"
                    placeholder="Enter your name"
                    required
                    maxlength="120"
                    autocomplete="name"
                  />
                </div>

                <div class="form-field">
                  <label for="contact-email">Email address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    [(ngModel)]="form.email"
                    placeholder="you@example.com"
                    required
                    maxlength="254"
                    email
                    autocomplete="email"
                  />
                </div>
              </div>

              <div class="form-field">
                <label for="contact-subject">Subject *</label>
                <select
                  id="contact-subject"
                  name="subject"
                  [(ngModel)]="form.subject"
                  required
                >
                  <option value="" disabled>Select an enquiry type</option>
                  <option value="Product enquiry">Product enquiry</option>
                  <option value="Order enquiry">Order enquiry</option>
                  <option value="Shipping and delivery">Shipping and delivery</option>
                  <option value="Returns and refunds">Returns and refunds</option>
                  <option value="Warranty claim">Warranty claim</option>
                  <option value="Privacy enquiry">Privacy enquiry</option>
                  <option value="General enquiry">General enquiry</option>
                </select>
              </div>

              <div class="form-field">
                <label for="contact-message">Your message *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  [(ngModel)]="form.message"
                  placeholder="Tell us how we can help..."
                  rows="6"
                  required
                  minlength="10"
                  maxlength="5000"
                ></textarea>

                <span class="character-count">
                  {{ form.message.length }}/5000
                </span>
              </div>

              <!-- Hidden anti-spam field -->
              <div class="honeypot" aria-hidden="true">
                <label for="contact-website">Leave this field empty</label>
                <input
                  id="contact-website"
                  type="text"
                  name="website"
                  [(ngModel)]="honeypot"
                  tabindex="-1"
                  autocomplete="off"
                />
              </div>

              <div class="privacy-note">
                <mat-icon>lock</mat-icon>
                <p>
                  Your information will only be used to respond to your
                  enquiry. Read our
                  <a routerLink="/policies" fragment="privacy">
                    Privacy Policy
                  </a>.
                </p>
              </div>

              @if (errorMessage) {
                <div class="form-alert form-alert--error" role="alert">
                  <mat-icon>error_outline</mat-icon>
                  {{ errorMessage }}
                </div>
              }

              @if (successMessage) {
                <div class="form-alert form-alert--success" role="status">
                  <mat-icon>check_circle</mat-icon>
                  {{ successMessage }}
                </div>
              }

              <button
                mat-flat-button
                type="submit"
                class="submit-button"
                [disabled]="isSubmitting || contactForm.invalid"
              >
                <mat-icon [class.spin]="isSubmitting">
                  {{ isSubmitting ? 'autorenew' : 'send' }}
                </mat-icon>
                {{ isSubmitting ? 'Sending message...' : 'Send message' }}
              </button>
            </form>
          </div>

          <!-- Side information -->
          <aside class="contact-side">

            <div class="side-card side-card--dark">
              <div class="side-card-icon">
                <mat-icon>support_agent</mat-icon>
              </div>

              <h3>We're happy to help.</h3>

              <p>
                Whether you need help choosing the right audio accessory
                or have a question about an existing order, our team is
                ready to assist.
              </p>

              <a
                [href]="whatsapp.contactUrl()"
                target="_blank"
                rel="noopener"
                class="side-whatsapp-link"
              >
                <mat-icon>chat</mat-icon>
                Talk to us on WhatsApp
              </a>
            </div>

            <div class="side-card order-card">
              <h3>How to order</h3>

              <div class="order-steps">
                <div class="order-step">
                  <span>01</span>
                  <div>
                    <strong>Browse products</strong>
                    <p>Explore our range of music and audio accessories.</p>
                  </div>
                </div>

                <div class="order-step">
                  <span>02</span>
                  <div>
                    <strong>Add to cart</strong>
                    <p>Choose your products and review your cart.</p>
                  </div>
                </div>

                <div class="order-step">
                  <span>03</span>
                  <div>
                    <strong>Secure checkout</strong>
                    <p>Enter your details and complete payment through Paystack.</p>
                  </div>
                </div>

                <div class="order-step">
                  <span>04</span>
                  <div>
                    <strong>We process your order</strong>
                    <p>We'll confirm your order and arrange delivery.</p>
                  </div>
                </div>
              </div>

              <a routerLink="/shop" class="shop-link">
                Explore the shop
                <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>

          </aside>
        </div>

      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      color: var(--tm-text);
    }

    .contact-hero {
      background:
        radial-gradient(circle at 85% 15%, rgba(255,255,255,.10), transparent 30%),
        linear-gradient(135deg, var(--tm-primary-dark), var(--tm-primary));
      color: #fff;
      padding: 76px 0 72px;
    }

    .contact-hero__inner {
      max-width: 1000px;
    }

    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #c6e5dc;
      font-size: .75rem;
      font-weight: 700;
      letter-spacing: 1.8px;
      margin-bottom: 18px;
    }

    .hero-eyebrow mat-icon {
      font-size: 19px;
      width: 19px;
      height: 19px;
    }

    .contact-hero h1 {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      letter-spacing: -1.8px;
      line-height: 1.1;
      margin: 0 0 16px;
    }

    .contact-hero p {
      color: #d7e9e4;
      font-size: 1.1rem;
      line-height: 1.7;
      max-width: 570px;
      margin: 0;
    }

    .hero-links {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      margin-top: 28px;
    }

    .hero-links a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #fff;
      font-weight: 600;
      font-size: .92rem;
      text-decoration: none;
    }

    .hero-links a:hover {
      color: #c6e5dc;
    }

    .contact-section {
      padding-top: 60px;
      padding-bottom: 80px;
    }

    .section-heading {
      text-align: center;
      margin-bottom: 34px;
    }

    .section-heading > span,
    .form-eyebrow {
      color: var(--tm-primary);
      font-size: .72rem;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    .section-heading h2 {
      font-size: 2rem;
      font-weight: 750;
      letter-spacing: -.5px;
      margin: 8px 0;
    }

    .section-heading p {
      color: var(--tm-text-muted);
      margin: 0;
    }

    .contact-methods {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
      margin-bottom: 42px;
    }

    .contact-method {
      background: var(--tm-surface);
      border: 1px solid var(--tm-border);
      border-radius: 16px;
      padding: 26px;
      transition: transform .2s ease, box-shadow .2s ease;
    }

    .contact-method:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(0,0,0,.06);
    }

    .method-icon {
      width: 48px;
      height: 48px;
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 18px;
    }

    .method-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .whatsapp-icon {
      background: #e4f5ec;
      color: #16834c;
    }

    .email-icon {
      background: #e7efff;
      color: #3768b5;
    }

    .hours-icon {
      background: #fff1df;
      color: #b66b17;
    }

    .contact-method h3 {
      font-size: 1.08rem;
      margin: 0 0 9px;
      font-weight: 700;
    }

    .contact-method p {
      color: var(--tm-text-muted);
      font-size: .88rem;
      line-height: 1.7;
      margin: 0 0 18px;
    }

    .method-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--tm-primary);
      font-weight: 700;
      font-size: .88rem;
      text-decoration: none;
    }

    .method-link mat-icon {
      font-size: 17px;
      width: 17px;
      height: 17px;
    }

    .method-link:hover {
      text-decoration: underline;
    }

    .method-note {
      display: block;
      color: var(--tm-text-muted);
      font-size: .78rem;
      margin-top: 5px;
    }

    .contact-main-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) minmax(280px, .9fr);
      gap: 26px;
      align-items: start;
    }

    .contact-form-panel {
      background: var(--tm-surface);
      border: 1px solid var(--tm-border);
      border-radius: 18px;
      padding: 34px;
    }

    .form-heading {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
      margin-bottom: 28px;
    }

    .form-heading h2 {
      font-size: 1.65rem;
      font-weight: 750;
      margin: 7px 0;
    }

    .form-heading p {
      color: var(--tm-text-muted);
      font-size: .9rem;
      line-height: 1.6;
      margin: 0;
    }

    .form-heading-icon {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(36,89,79,.09);
      color: var(--tm-primary);
      border-radius: 14px;
    }

    .form-heading-icon mat-icon {
      font-size: 25px;
      width: 25px;
      height: 25px;
    }

    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 19px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }

    .form-field label {
      font-size: .85rem;
      font-weight: 650;
    }

    .form-field input,
    .form-field select,
    .form-field textarea {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--tm-border);
      border-radius: 9px;
      background: var(--tm-background, #fff);
      color: var(--tm-text);
      padding: 13px 14px;
      font: inherit;
      font-size: .9rem;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
    }

    .form-field input,
    .form-field select {
      min-height: 48px;
    }

    .form-field textarea {
      resize: vertical;
      min-height: 145px;
      line-height: 1.6;
    }

    .form-field input:focus,
    .form-field select:focus,
    .form-field textarea:focus {
      border-color: var(--tm-primary);
      box-shadow: 0 0 0 3px rgba(36,89,79,.10);
    }

    .form-field input::placeholder,
    .form-field textarea::placeholder {
      color: #999;
    }

    .character-count {
      align-self: flex-end;
      color: var(--tm-text-muted);
      font-size: .75rem;
      margin-top: -4px;
    }

    .privacy-note {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 13px;
      border-radius: 9px;
      background: rgba(36,89,79,.06);
    }

    .privacy-note mat-icon {
      flex-shrink: 0;
      color: var(--tm-primary);
      font-size: 19px;
      width: 19px;
      height: 19px;
    }

    .privacy-note p {
      color: var(--tm-text-muted);
      font-size: .8rem;
      line-height: 1.6;
      margin: 0;
    }

    .privacy-note a {
      color: var(--tm-primary);
      font-weight: 700;
    }

    .submit-button {
      min-height: 49px;
      border-radius: 9px;
      background: var(--tm-primary) !important;
      color: #fff !important;
      font-weight: 700;
      align-self: flex-start;
      padding: 0 25px;
    }

    .submit-button mat-icon {
      margin-right: 7px;
    }

    .submit-button:disabled {
      opacity: .6;
    }

    .form-alert {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      border-radius: 9px;
      padding: 13px;
      font-size: .85rem;
      line-height: 1.5;
    }

    .form-alert mat-icon {
      flex-shrink: 0;
    }

    .form-alert--error {
      background: #fff0f0;
      color: #a42a2a;
    }

    .form-alert--success {
      background: #e9f7ef;
      color: #176b3b;
    }

    .honeypot {
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }

    .contact-side {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .side-card {
      border-radius: 16px;
      padding: 27px;
    }

    .side-card--dark {
      background: linear-gradient(145deg, var(--tm-primary-dark), var(--tm-primary));
      color: #fff;
    }

    .side-card-icon {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: rgba(255,255,255,.14);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 18px;
    }

    .side-card-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .side-card--dark h3 {
      font-size: 1.35rem;
      margin: 0 0 10px;
    }

    .side-card--dark p {
      color: #d5e7e2;
      font-size: .88rem;
      line-height: 1.7;
      margin: 0 0 20px;
    }

    .side-whatsapp-link {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      background: #fff;
      color: var(--tm-primary-dark);
      padding: 12px 15px;
      border-radius: 8px;
      font-weight: 700;
      font-size: .85rem;
      text-decoration: none;
    }

    .side-whatsapp-link:hover {
      background: #e8f3ef;
    }

    .order-card {
      background: var(--tm-surface);
      border: 1px solid var(--tm-border);
    }

    .order-card h3 {
      font-size: 1.2rem;
      margin: 0 0 22px;
    }

    .order-steps {
      display: flex;
      flex-direction: column;
      gap: 21px;
    }

    .order-step {
      display: flex;
      align-items: flex-start;
      gap: 13px;
    }

    .order-step > span {
      flex-shrink: 0;
      color: var(--tm-primary);
      background: rgba(36,89,79,.09);
      border-radius: 8px;
      padding: 7px 8px;
      font-size: .76rem;
      font-weight: 800;
    }

    .order-step strong {
      display: block;
      font-size: .88rem;
      margin-bottom: 4px;
    }

    .order-step p {
      color: var(--tm-text-muted);
      font-size: .8rem;
      line-height: 1.6;
      margin: 0;
    }

    .shop-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--tm-border);
      margin-top: 23px;
      padding-top: 18px;
      color: var(--tm-primary);
      font-size: .88rem;
      font-weight: 700;
      text-decoration: none;
    }

    .shop-link:hover {
      text-decoration: underline;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 900px) {
      .contact-methods {
        grid-template-columns: 1fr 1fr;
      }

      .contact-main-grid {
        grid-template-columns: 1fr;
      }

      .contact-side {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 600px) {
      .contact-hero {
        padding: 52px 0;
      }

      .contact-hero h1 {
        letter-spacing: -1px;
      }

      .contact-section {
        padding-top: 42px;
        padding-bottom: 55px;
      }

      .contact-methods {
        grid-template-columns: 1fr;
      }

      .contact-method {
        padding: 22px;
      }

      .contact-form-panel {
        padding: 23px 18px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .contact-side {
        grid-template-columns: 1fr;
      }

      .submit-button {
        width: 100%;
      }

      .hero-links {
        flex-direction: column;
        gap: 15px;
      }
    }
  `],
})
export class ContactComponent {
  whatsapp = inject(WhatsAppService);
  private supabaseService = inject(SupabaseService);

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  honeypot = '';

  form = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  async submitForm(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isSubmitting) return;

    if (
      !this.form.name.trim() ||
      !this.form.email.trim() ||
      !this.form.subject.trim() ||
      this.form.message.trim().length < 10
    ) {
      this.errorMessage = 'Please complete all fields before submitting.';
      return;
    }

    this.isSubmitting = true;

    try {
      const { data, error } =
        await this.supabaseService.supabase.functions.invoke(
          'send-contact-message',
          {
            body: {
              name: this.form.name.trim(),
              email: this.form.email.trim(),
              subject: this.form.subject.trim(),
              message: this.form.message.trim(),
              website: this.honeypot,
            },
          }
        );

      if (error) {
        console.error('Contact form error:', error);
        throw new Error('We could not send your message. Please try again.');
      }

      if (!data?.success) {
        throw new Error(
          data?.message || 'We could not send your message. Please try again.'
        );
      }

      this.successMessage =
        'Thank you! Your message has been sent successfully. We will get back to you soon.';

      this.form = {
        name: '',
        email: '',
        subject: '',
        message: '',
      };

      this.honeypot = '';

    } catch (error) {
      console.error('Contact form submission failed:', error);

      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again later.';

    } finally {
      this.isSubmitting = false;
    }
  }
}
