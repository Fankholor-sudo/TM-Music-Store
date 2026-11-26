import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GeoapifyService, GeoapifyPlace } from '@/app/services/geoapify.service';

declare const L: any;

@Component({
  selector: 'app-map-picker-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="map-modal-overlay" (click)="onBackdropClick($event)">
      <div class="map-modal" (click)="$event.stopPropagation()">
        <div class="map-modal__header">
          <h2><mat-icon>location_on</mat-icon> Select your location</h2>
          <button type="button" mat-icon-button (click)="close.emit()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="map-modal__body">
          @if (loading()) {
            <div class="map-loading">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading map…</p>
            </div>
          }
          <div #mapContainer class="map-canvas"></div>

          @if (selectedPlace()) {
            <div class="map-selected">
              <mat-icon>place</mat-icon>
              <span>{{ selectedPlace()?.formatted }}</span>
            </div>
          }
        </div>

        <div class="map-modal__actions">
          <button
            type="button"
            mat-stroked-button
            class="tm-outline-btn"
            (click)="useMyLocation()"
            [disabled]="locating()"
          >
            @if (locating()) {
              <mat-spinner diameter="18"></mat-spinner> Locating…
            } @else {
              <ng-container>
                <mat-icon>my_location</mat-icon> Use my current location
              </ng-container>
            }
          </button>
          <button
            type="button"
            mat-flat-button
            class="tm-primary-btn"
            (click)="confirm()"
            [disabled]="!selectedPlace()"
          >
            <mat-icon>check</mat-icon> Confirm location
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      z-index: 9999; display: flex; align-items: center;
      justify-content: center; padding: 16px;
    }
    .map-modal {
      background: var(--tm-surface, #fff); border-radius: 12px;
      width: 100%; max-width: 640px; max-height: 90vh;
      display: flex; flex-direction: column; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    }
    .map-modal__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid var(--tm-border, #e0e0e0);
    }
    .map-modal__header h2 {
      margin: 0; font-size: 1.05rem; font-weight: 700;
      display: flex; align-items: center; gap: 8px;
    }
    .map-modal__header h2 mat-icon { color: var(--tm-primary, #00796b); }
    .map-modal__body { position: relative; flex: 1; min-height: 320px; }
    .map-canvas { width: 100%; height: 360px; }
    .map-loading {
      position: absolute; inset: 0; z-index: 1000;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; background: rgba(255,255,255,0.85); gap: 12px;
    }
    .map-selected {
      display: flex; align-items: flex-start; gap: 8px; padding: 10px 16px;
      background: var(--tm-bg, #f5f5f5); border-top: 1px solid var(--tm-border, #e0e0e0);
      font-size: 0.85rem; color: var(--tm-text, #333);
    }
    .map-selected mat-icon {
      color: var(--tm-primary, #00796b); flex-shrink: 0;
      font-size: 1.1rem; width: 1.1rem; height: 1.1rem; margin-top: 2px;
    }
    .map-modal__actions {
      display: flex; justify-content: space-between; gap: 12px;
      padding: 16px 20px; border-top: 1px solid var(--tm-border, #e0e0e0);
    }
    .map-modal__actions button { height: 42px; }
    @media (max-width: 500px) {
      .map-modal__actions { flex-direction: column; }
      .map-canvas { height: 280px; }
    }
  `],
})
export class MapPickerModalComponent implements AfterViewInit, OnDestroy {
  @Input() initialLat: number | null = null;
  @Input() initialLng: number | null = null;
  @Output() locationSelected = new EventEmitter<GeoapifyPlace>();
  @Output() close = new EventEmitter<void>();

  private geoapify = inject(GeoapifyService);
  private readonly platformId = inject(PLATFORM_ID);
  @ViewChild('mapContainer', { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;

  loading = signal(true);
  locating = signal(false);
  selectedPlace = signal<GeoapifyPlace | null>(null);

  private map: any = null;
  private marker: any = null;
  private leafletLoaded = false;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.loadLeaflet().then(() => this.initMap());
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.remove(); this.map = null; }
  }

  private async loadLeaflet(): Promise<void> {
    if (this.leafletLoaded || (typeof window !== 'undefined' && (window as any).L)) {
      this.leafletLoaded = true; return;
    }
    return new Promise((resolve, reject) => {
      const head = document.head;
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      head.appendChild(css);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { this.leafletLoaded = true; resolve(); };
      script.onerror = () => reject(new Error('Failed to load Leaflet'));
      head.appendChild(script);
    });
  }

  private initMap(): void {
    const lat = this.initialLat ?? -29.0;
    const lng = this.initialLng ?? 24.0;
    const apiKey = this.geoapify.getApiKey();
    const tileUrl = this.geoapify.getMapStyleUrl('positron');

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: this.initialLat !== null ? 15 : 5,
    });

    L.tileLayer(tileUrl, {
      attribution: 'Powered by Geoapify', maxZoom: 20, apiKey,
    } as any).addTo(this.map);

    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.handlePick(pos.lat, pos.lng);
    });

    this.map.on('click', (e: any) => {
      this.marker.setLatLng(e.latlng);
      this.handlePick(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(() => this.map.invalidateSize(), 200);
    this.loading.set(false);

    if (this.initialLat !== null && this.initialLng !== null) {
      this.handlePick(lat, lng);
    }
  }

  private async handlePick(lat: number, lng: number): Promise<void> {
    const place = await this.geoapify.reverseGeocode(lat, lng);
    if (place) {
      this.selectedPlace.set(place);
    } else {
      this.selectedPlace.set({ formatted: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lon: lng });
    }
  }

  async useMyLocation(): Promise<void> {
    if (!this.isBrowser || !navigator.geolocation) return;
    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        this.map.setView([latitude, longitude], 16);
        this.marker.setLatLng([latitude, longitude]);
        await this.handlePick(latitude, longitude);
        this.locating.set(false);
      },
      () => { this.locating.set(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  confirm(): void {
    const place = this.selectedPlace();
    if (place) { this.locationSelected.emit(place); }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) { this.close.emit(); }
  }
}
