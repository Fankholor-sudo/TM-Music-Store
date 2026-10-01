import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { App } from './app/app';
import { HomeComponent } from './app/pages/home/home.component';
import { ShopComponent } from './app/pages/shop/shop.component';
import { ProductDetailComponent } from './app/pages/product-detail/product-detail.component';
import { AboutComponent } from './app/pages/about/about.component';
import { ContactComponent } from './app/pages/contact/contact.component';
import { SearchComponent } from './app/pages/search/search.component';
import { CategoryComponent } from './app/pages/category/category.component';

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

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
  ],
});
