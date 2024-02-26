import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CartComponent } from './cart/cart.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagenPipe } from './pipes/imagen.pipe';
import { CartFormComponent } from './core/cart-form/cart-form.component';
import { FooterComponent } from './core/footer/footer.component';
import { ProductComponent } from './pages/product/product.component';
import { NoSanitizePipe } from './pipes/no-sanitize.pipe';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SliderProductImgComponent } from './core/slider-product-img/slider-product-img.component';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  declarations: [
    AppComponent,
    CartComponent,
    ImagenPipe,
    CartFormComponent,
    FooterComponent,
    ProductComponent,
    NoSanitizePipe,
    NotFoundComponent,
    SliderProductImgComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    SwiperModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
