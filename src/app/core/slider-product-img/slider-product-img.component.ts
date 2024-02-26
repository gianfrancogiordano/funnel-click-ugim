import { Component, Input, OnInit, ViewChild } from '@angular/core';
import SwiperCore, { SwiperOptions, Navigation, Pagination, A11y, Autoplay, Swiper } from 'swiper';
import { SwiperComponent } from 'swiper/angular';

// install Swiper modules
SwiperCore.use([Navigation, Pagination, A11y, Autoplay]);

@Component({
  selector: 'app-slider-product-img',
  templateUrl: './slider-product-img.component.html',
  styleUrls: ['./slider-product-img.component.css']
})
export class SliderProductImgComponent implements OnInit {

  @ViewChild('swiper', { static: false })
  public swiper: SwiperComponent | any;

  public selectedImgView: string = '';

  @Input()
  public images: string[] = [];

  public configBig: SwiperOptions = {
    initialSlide: 0,
    autoplay: { delay: 1000, disableOnInteraction: false },
    slidesPerView: 1,
    spaceBetween: 0,
  };

  public config: SwiperOptions = {
    initialSlide: 0,
    slidesPerView: 4,
    spaceBetween: 5,
    pagination: { clickable: true, type: 'bullets', el: '.swiper-custom-pagination' }
  };

  constructor() { }

  ngOnInit(): void { }

  changeImgView(img: string) {
    this.selectedImgView = img;
  }

  onSwiper(event: any) {
    for (const title of Object.keys(event)) {
      const swiper = event[title];
      if (swiper?.clickedIndex) {
        this.swiper.swiperRef.slideTo(swiper.clickedIndex);
      }
    }
  }

}
