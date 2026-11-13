import { Injectable, inject, DOCUMENT } from '@angular/core';
import { environment } from '../../environments/environment';

export interface PaystackCallbacks {
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

interface PaystackHandler {
  open: () => void;
}

interface PaystackInline {
  setup: (config: Record<string, unknown>) => PaystackHandler;
  resumeTransaction: (accessCode: string, callbacks: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    PaystackPop?: PaystackInline;
  }
}

@Injectable({ providedIn: 'root' })
export class PaystackService {
  private document = inject(DOCUMENT);

  private get window(): Window & typeof globalThis {
    return this.document.defaultView as Window & typeof globalThis;
  }

  private get publicKey(): string {
    return environment.paystackPublicKey;
  }

  generateReference(): string {
    const prefix = 'MUSO';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.window.PaystackPop) {
        resolve();
        return;
      }
      const script = this.document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Failed to load Paystack payment script.'));
      this.document.head.appendChild(script);
    });
  }

  async resumeTransaction(
    accessCode: string,
    callbacks: PaystackCallbacks,
  ): Promise<void> {
    await this.loadScript();
    if (!this.window.PaystackPop) {
      throw new Error('Paystack payment library not available.');
    }
    this.window.PaystackPop.resumeTransaction(accessCode, {
      callback: (response: { reference: string }) => callbacks.onSuccess(response.reference),
      onClose: callbacks.onClose,
    });
  }

  async pay(params: {
    email: string;
    amount: number;
    reference: string;
    firstName: string;
    lastName: string;
    phone: string;
    callbacks: PaystackCallbacks;
  }): Promise<void> {
    await this.loadScript();

    if (!this.window.PaystackPop) {
      throw new Error('Paystack payment library not available.');
    }

    const handler = this.window.PaystackPop.setup({
      key: this.publicKey,
      email: params.email,
      amount: Math.round(params.amount * 100),
      currency: 'ZAR',
      ref: params.reference,
      firstname: params.firstName,
      lastname: params.lastName,
      phone: params.phone,
      callback: (response: { reference: string }) =>
        params.callbacks.onSuccess(response.reference),
      onClose: () => params.callbacks.onClose(),
    });

    handler.open();
  }
}