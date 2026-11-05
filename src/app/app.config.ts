import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { SearchComponent } from './pages/search/search.component';
import { CategoryComponent } from './pages/category/category.component';

const routes = [
  { path: '', component: HomeComponent, title: 'MusoHive — Quality Music Accessories' },
  { path: 'shop', component: ShopComponent, title: 'Shop — MusoHive' },
  { path: 'categories/:slug', component: CategoryComponent, title: 'Category — MusoHive' },
  { path: 'products/:slug', component: ProductDetailComponent, title: 'Product — MusoHive' },
  { path: 'search', component: SearchComponent, title: 'Search — MusoHive' },
  { path: 'about', component: AboutComponent, title: 'About — MusoHive' },
  { path: 'contact', component: ContactComponent, title: 'Contact — MusoHive' },
  { path: '**', redirectTo: '' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(withFetch()),
  ],
};
