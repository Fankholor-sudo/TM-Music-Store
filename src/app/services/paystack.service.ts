import { Injectable, inject, DOCUMENT } from '@angular/core';
import { environment } from '../../environments/environment';

export interface PaystackCallbacks {
  onSuccess: (reference: string) => void;
  onClose: () => void;
  onError?: (message: string) => void;
}

interface PaystackTransaction {
  reference: string;
}

interface PaystackError {
  message: string;
}

interface PaystackResumeCallbacks {
  onSuccess: (transaction: PaystackTransaction) => void;
  onCancel: () => void;
  onError: (error: PaystackError) => void;
}

interface PaystackInlineInstance {
  resumeTransaction: (
    accessCode: string,
    callbacks?: PaystackResumeCallbacks,
  ) => void;

  newTransaction: (config: Record<string, unknown>) => void;
}

interface PaystackInlineConstructor {
  new (): PaystackInlineInstance;
}

declare global {
  interface Window {
    PaystackPop?: PaystackInlineConstructor;
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

      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;

      script.onload = () => {
        if (this.window.PaystackPop) {
          resolve();
        } else {
          reject(new Error('Paystack payment library not available.'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Paystack payment script.'));
      };

      this.document.head.appendChild(script);
    });
  }

  async resumeTransaction(
    accessCode: string,
    callbacks: PaystackCallbacks,
  ): Promise<void> {
    await this.loadScript();

    const PaystackPop = this.window.PaystackPop;

    if (!PaystackPop) {
      throw new Error('Paystack payment library not available.');
    }

    const popup = new PaystackPop();

    popup.resumeTransaction(accessCode, {
      onSuccess: (transaction) => {
        callbacks.onSuccess(transaction.reference);
      },

      onCancel: () => {
        callbacks.onClose();
      },

      onError: (error) => {
        console.error('Paystack transaction error:', error);
        callbacks.onError?.(error.message);
      },
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

    const PaystackPop = this.window.PaystackPop;

    if (!PaystackPop) {
      throw new Error('Paystack payment library not available.');
    }

    const popup = new PaystackPop();

    popup.newTransaction({
      key: this.publicKey,
      email: params.email,
      amount: Math.round(params.amount * 100),
      currency: 'ZAR',
      reference: params.reference,
      firstName: params.firstName,
      lastName: params.lastName,
      phone: params.phone,

      onSuccess: (transaction: PaystackTransaction) => {
        params.callbacks.onSuccess(transaction.reference);
      },

      onCancel: () => {
        params.callbacks.onClose();
      },

      onError: (error: PaystackError) => {
        console.error('Paystack transaction error:', error);
        params.callbacks.onError?.(error.message);
      },
    });
  }
}
