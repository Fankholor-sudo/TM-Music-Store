import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { environment } from "@/environments/environment";
import { SupabaseService } from "./supabase.service";

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

interface GeoapifyFunctionResponse {
  success: boolean;
  results?: any[];
  result?: any;
  error?: string;
}

@Injectable({ providedIn: "root" })
export class GeoapifyService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly supabase = inject(SupabaseService).supabase;

  private readonly apiKey = environment.geoapifyKey;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async autocomplete(query: string, limit = 5): Promise<GeoapifyPlace[]> {
    if (!this.isBrowser || !query || query.trim().length < 3) {
      return [];
    }

    try {
      const { data, error } =
        await this.supabase.functions.invoke<GeoapifyFunctionResponse>(
          "geoapify",
          {
            body: {
              action: "autocomplete",
              query: query.trim(),
              limit,
            },
          },
        );

      if (error) {
        console.error("Geoapify Autocomplete Error:", error);
        return [];
      }

      if (!data?.success) {
        console.error("Geoapify Autocomplete Error:", data?.error);
        return [];
      }

      return (data.results ?? []).map((r) => this.mapResult(r));
    } catch (error) {
      console.error("Geoapify Autocomplete Network Error:", error);
      return [];
    }
  }

  async reverseGeocode(
    lat: number,
    lon: number,
  ): Promise<GeoapifyPlace | null> {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const { data, error } =
        await this.supabase.functions.invoke<GeoapifyFunctionResponse>(
          "geoapify",
          {
            body: {
              action: "reverse",
              lat,
              lon,
            },
          },
        );

      if (error) {
        console.error("Geoapify Reverse Geocoding Error:", error);
        return null;
      }

      if (!data?.success) {
        console.error("Geoapify Reverse Geocoding Error:", data?.error);
        return null;
      }
      return data.result ? this.mapResult(data.result) : null;
    } catch (error) {
      console.error("Geoapify Reverse Geocoding Network Error:", error);
      return null;
    }
  }

  getMapStyleUrl(style: string): string {
    return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${this.apiKey}`;
  }

  getApiKey(): string {
    return this.apiKey ?? "";
  }

  private mapResult(r: any): GeoapifyPlace {
    return {
      formatted: r.formatted ?? "",
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
