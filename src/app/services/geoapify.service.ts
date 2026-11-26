import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@/environments/environment';

export interface GeoapifyPlace {
  formatted: string;
  lat: number;
  lon: number;
  city?: string;
  postcode?: string;
  street?: string;
  housenumber?: string;
  suburb?: string;
  state?: string;
  country?: string;
}

@Injectable({ providedIn: 'root' })
export class GeoapifyService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiKey = environment.geoapifyKey;
  private readonly baseUrl = 'https://api.geoapify.com/v1';

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async autocomplete(query: string, limit = 5): Promise<GeoapifyPlace[]> {
    if (!this.isBrowser || !query || query.trim().length < 3 || !this.apiKey) {
      return [];
    }
    const url =
      `${this.baseUrl}/geocode/autocomplete?text=${encodeURIComponent(query)}` +
      `&limit=${limit}&format=json&apiKey=${this.apiKey}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results ?? []).map((r: any) => this.mapResult(r));
    } catch {
      return [];
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<GeoapifyPlace | null> {
    if (!this.isBrowser || !this.apiKey) {
      console.error('Geoapify: API key missing or not running in browser.');
      return null;
    }

    const url =
      `${this.baseUrl}/geocode/reverse?lat=${lat}&lon=${lon}` +
      `&format=json&apiKey=${this.apiKey}`;

    try {
      const res = await fetch(url);

      if (!res.ok) {
        const error = await res.json();
        console.error('Geoapify Reverse Geocoding Error:', {
          status: res.status,
          statusText: res.statusText,
          error
        });
        return null;
      }

      const data = await res.json();
      const r = data.results?.[0];
      return r ? this.mapResult(r) : null;
    } catch (error) {
      console.error('Geoapify Network Error:', error);
      return null;
    }
  }

  getMapStyleUrl(style: string): string {
    return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${this.apiKey}`;
  }

  getApiKey(): string {
    return this.apiKey ?? '';
  }

  private mapResult(r: any): GeoapifyPlace {
    return {
      formatted: r.formatted ?? '',
      lat: r.lat,
      lon: r.lon,
      city: r.city,
      postcode: r.postcode,
      street: r.street,
      housenumber: r.housenumber,
      suburb: r.suburb,
      state: r.state,
      country: r.country,
    };
  }
}
