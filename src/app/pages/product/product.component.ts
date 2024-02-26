import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarketService } from 'src/app/services/market.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  public logo: string = '';
  public wsnumber: string = '';
  public clickstoreProducto: any = {
    id: '',
    title: '',
    categoria: '',
    precio: 0,
    descuento: 0
  }
  
  constructor(public marketService: MarketService,
              private route: ActivatedRoute) { this.route.params.subscribe({ next: (p: any) => {
                if (p.sede) { this.getProducto(p.id, p.sede); }
                else { this.getProducto(p.id); }
              } }) }

  ngOnInit(): void { }

  getProducto(id: string, sede?: number) {
    this.marketService.getProduct(id)
      .subscribe({ next: (v) => {

        console.log(v);

        if ( sede ) { this.wsnumber = v.producto.negocio.sedes[sede].wsnumber }
        else {  this.wsnumber = v.producto.negocio.sedes[0].wsnumber }

        this.marketService.producto = v.producto;
        this.logo = v.producto.negocio.logo;

        console.log(this.wsnumber);

      }})
  }

}
