import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export interface CheckoutItemInput {
  product_id: string;
  quantity: number;
}

export interface CreateOrderPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  shipping_method: 'pep_store' | 'door_delivery';
  pep_store_location: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_postal_code: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  items: CheckoutItemInput[];
}

export interface CreateOrderResult {
  success: boolean;
  order_id?: string;
  reference?: string;
  access_code?: string;
  authorization_url?: string;
  total?: number;
  error?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  order_id?: string;
  reference?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    return this.post<CreateOrderResult>('create-order', payload, 'Could not start checkout');
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    return this.post<VerifyPaymentResult>('verify-payment', { reference }, 'Could not verify payment');
  }

  private async post<T extends { success?: boolean; error?: string }>(
    functionName: string,
    payload: unknown,
    fallbackError: string,
  ): Promise<T> {
    try {
      const response = await fetch(`${environment.supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${environment.supabaseAnonKey}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as T;
      if (!response.ok || data.success !== true) {
        return { ...data, success: false, error: data.error || fallbackError };
      }
      return data;
    } catch {
      return { success: false, error: fallbackError } as T;
    }
  }
}
