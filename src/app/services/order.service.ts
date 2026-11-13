import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '@/app/services/supabase.service';
import { OrderItem } from '@/app/models/order.model';
import { firstValueFrom, from } from 'rxjs';
import { environment } from '@/environments/environment';

export interface CheckoutPayload {
  reference: string;
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
  subtotal: number;
  shipping_cost: number;
  total: number;
  items: OrderItem[];
}

export interface VerifyResult {
  success: boolean;
  order_id?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private supabase = inject(SupabaseService).supabase;

  async verifyAndSaveOrder(payload: CheckoutPayload): Promise<VerifyResult> {
    const url = `${environment.supabaseUrl}/functions/v1/verify-order`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${environment.supabaseAnonKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let error = `Request failed (${response.status})`;
      try {
        const body = await response.json();
        if (body?.error) error = body.error;
      } catch {
        // ignore parse error
      }
      return { success: false, error };
    }

    const data = await response.json();
    if (!data || data.success !== true) {
      return { success: false, error: data?.error || 'Verification failed' };
    }
    return { success: true, order_id: data.order_id };
  }

  async getOrderByReference(reference: string) {
    return firstValueFrom(
      from(
        this.supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('reference', reference)
          .maybeSingle(),
      ),
    );
  }
}