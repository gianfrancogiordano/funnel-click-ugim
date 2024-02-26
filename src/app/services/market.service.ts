import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs';
import ObjectID from 'bson-objectid';
import { FbApiConversionService } from './fb-api-conversion.service';
import { CookieService } from 'ngx-cookie-service';

declare let fbq: Function;
const base_url = environment.base_url;
const apiToken = environment.apiFB;
const pixel = environment.pixel;

@Injectable({
  providedIn: 'root'
})
export class MarketService {

  public producto: any = {
    editar: false,
    title: '',
    descripcion: '',
    extraimages: [],
    images: [],
    position: null,
    precio: null,
    preciomayor: null,
    descuento: null,
    descuentomayor: null,
    activo: true,
    configuracion: {
      size: [],
      colors: []
    },
    variacion: [],
    referencias: [],
    inventario: {
      sku: '',
      idfabrica: '',
      idbarras: '',
      pesokg: null,
      stock: null,
      alarma_stock: null,
      gestionarstock: false
    },
    costo: null,
    clickcount: null,
    showdetal: true,
    showmayor: true,
    categoria: '',
    categories: [],
    negocio: { logo: '', sedes: [] }
  }

  public clientIp: string = '';
  public initPixel: boolean = false;

  public shoppingcart: any = {
    clientIp: '',
    fbclid: false,
    backBtn: -2,
    total: 0,
    descuentoPedido: { monto: 0, title: '', _iddiscount: '' },
    totalDescuento: 0,
    totalProductos: 0,
    productos: [],
    wsnumber: ''
  };

  public pedido = {
    articulos: [],
    pago: '',
    valorTotal: 0,
    estado: '',
    city: '',
    country_name: '',
    country_code: '',
    country_code_iso3: '',
    region: '',
    activo: true,
    negocio: ''
  }

  constructor(private http: HttpClient,
              private fbApiConv: FbApiConversionService,
              private cookieService: CookieService ) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  getProduct(producto: string) {
    return this.http.get(`${base_url}/market/product/${producto}`, this.headers)
      .pipe(
        map((resp: any) => resp.body)
      )
  }

  getPedido(idPedido: string) {
    return this.http.get(`${base_url}/pedidos/${idPedido}`).pipe( map((resp: any) => resp.body) )
  }

  buscarIp() { return this.http.get(`https://api.ipify.org/?format=json`); }

  nuevoPedido(campos: any) {
    return this.http.post(`${base_url}/pedidos`, campos, this.headers)
      .pipe(
        map((resp: any) => resp.body)
      );
  }

  analyticsUpsert(negocio: string, action: string) {
    return this.http.put(`${base_url}/analytics/${negocio}?action=${action}`, this.headers)
      .pipe(map((resp: any) => resp.body ))
  }

  trackPixel(action: string, producto?: any) {

    if (!this.initPixel) {
      fbq('init', pixel);
      this.initPixel = true;
    }

    let dataMeta = {};

    // Creamos el id del evento para enviarlo por API CONVERSIONS
    const _eventId = ObjectID().toHexString();

    if (producto) {
      const id: any[] = [producto._id];
      this.shoppingcart.productos.forEach((p: any) => { id.push(p._id) });
      dataMeta = {
        content_name: producto.title,
        content_category: producto.categoria,
        content_ids: id,
        content_type: 'product',
        value: producto.precio,
        currency: 'COP'
      }
    }

    fbq('track', action, dataMeta, { eventID: _eventId });

    // 2. Enviar en evento por API CONVERSIONS
    if (apiToken !== '') { // Si el negocio tiene un api token configurado entonces enviamos por server el evento

      // Buscamos _fbp y _fbc cookie
      const _fbp = this.cookieService.get('_fbp');
      const _fbc = this.cookieService.get('_fbc');

      if ( this.clientIp !== '' ) {
        
        const allData = { pixel, apiToken, dataMeta, action, _eventId, clientData: { domain: document.location.href, _fbp, _fbc, ip: this.clientIp } };
        this.fbApiConv.sendFbApiEvent(allData).subscribe({
          next: (v) => { console.log('FbApi', action); },
          error: (e) => { console.log(e) }
        });

      } else {

        this.buscarIp().subscribe({
          next: (resp: any) => {
            this.clientIp = resp.ip;
            const allData = { pixel, apiToken, dataMeta, action, _eventId, clientData: { domain: document.location.href, _fbp, _fbc, ip: this.clientIp } };
            this.fbApiConv.sendFbApiEvent(allData).subscribe({
              next: (v) => { console.log('FbApi', action); },
              error: (e) => { console.log(e) }
            });
          }
        });
      }

    }
  }

}
