import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imagen'
})
export class ImagenPipe implements PipeTransform {



  transform(img: string, tipo: string, ...args: any[]): any {

    // CloudFront o Proxy
    const serverImg = 'https://d3cj1y2eynyat2.cloudfront.net';

    const urlImg = `${serverImg}/${tipo}/${img}`;

    if (urlImg.includes('no-img.png') || urlImg.includes('noimg.png') || urlImg.includes('noimg.jpg') || urlImg.includes('noimg.jpg')) {
      return `/assets/images/no-img.png`;
    }

    if (img) {
      return `${serverImg}/${tipo}/${img}`;

    } else {
      return `/assets/images/no-img.png`;

    }

  }

}
