import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MarketService } from 'src/app/services/market.service';
import ObjectID from 'bson-objectid';
import { CookieService } from 'ngx-cookie-service';
import { FbApiConversionService } from 'src/app/services/fb-api-conversion.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

const apiToken = environment.apiFB;
const pixel = environment.pixel;
const negocio = environment.clickstoreId;

declare let fbq: Function;

@Component({
  selector: 'app-cart-form',
  templateUrl: './cart-form.component.html',
  styleUrls: ['./cart-form.component.css']
})
export class CartFormComponent implements OnInit {

  @Input()
  public clickstoreProducto: any = { id: '' }

  @Input()
  public wsnumber: string = '';

  public variacionImg: any = 0;
  public submitPedidoValidator: boolean = false;
  public submitPedido: boolean = false;
  
  public sendAddToCart: Subscription;
  public sendViewContent: boolean = false;

  public formClienteData = this.fb.group({
    variacion1: ['', [Validators.required]],
    variacion2: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    direccion: ['', [Validators.required]],
    departamento: ['', [Validators.required]],
    ciudad: ['', [Validators.required]],
    barrio: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern(/^(\s?\d)*\s?$/), Validators.minLength(5)]],
    email: ['', Validators.required],
    codigo: ['57', [Validators.required]],
    pago: ['CONTRAENTREGA']
  });

  @Input('producto-input')
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
    categories: []
  }

  constructor(private marketService: MarketService,
    private router: Router,
    private cookieService: CookieService,
    private fbApiConv: FbApiConversionService,
    private fb: FormBuilder) {

      this.marketService.trackPixel('PageView');
      this.marketService.analyticsUpsert(negocio, 'pageview').subscribe();

      this.sendAddToCart = this.formClienteData.controls['variacion2'].valueChanges.subscribe( (change: any) => {
        this.marketService.trackPixel('AddToCart', this.producto);
        this.marketService.analyticsUpsert(negocio, 'agregaralcarrito').subscribe();
        this.sendAddToCart.unsubscribe();
      });

    }

  ngOnInit(): void { }

  setImg(imgIndex: number) { this.variacionImg = imgIndex; }

  campoNoValido(campo: string): boolean {
    return this.formClienteData.get(campo)!.invalid && this.submitPedidoValidator ? true : false;
  }

  trackPixelPurchase(pixel: string, apiToken: string, total: number, action: string) {

    // Datos importantes del cliente
    const datosCliente: any = this.formClienteData.value

    // 1. Creamos el id del evento para enviarlo por API CONVERSIONS
    const _eventId = ObjectID().toHexString();

    const ids: any[] = [];
    this.marketService.shoppingcart.productos.forEach((p: any) => ids.push(p._id));

    const dataMeta = {
      content_ids: ids, // 'REQUIRED': array of product IDs
      value: total, // REQUIRED, up to 2 decimals optional
      currency: 'COP', // REQUIRED
      content_type: 'product', // RECOMMENDED: Either product or product_group based on the content_ids or contents being passed.
    };

    fbq('track', action, dataMeta, { eventID: _eventId });

    // 2. Enviar en evento por API CONVERSIONS
    if (apiToken !== '') { // Si el negocio tiene un api token configurado entonces enviamos por server el evento

      // Buscamos _fbp y _fbc cookie
      const _fbp = this.cookieService.get('_fbp');
      const _fbc = this.cookieService.get('_fbc');

      if (this.marketService.clientIp !== '') {

        const allData = {
          pixel,
          apiToken,
          dataMeta,
          action,
          _eventId,
          clientData: { email: datosCliente.email, codigo: datosCliente.codigo, telefono: `${datosCliente.telefono.trim().replace(/\s+/g, '')}`, domain: document.location.href, _fbp, _fbc, ip: this.marketService.clientIp }
        };

        this.fbApiConv.sendFbApiEvent(allData).subscribe({
          next: (v) => { console.log('FbApi', action); },
          error: (e) => { console.log(e) }
        });

      } else {

        this.marketService.buscarIp()
          .subscribe({
            next: (resp: any) => {

              this.marketService.clientIp = resp.ip;

              const allData = {
                pixel,
                apiToken,
                dataMeta,
                action,
                _eventId,
                clientData: { email: datosCliente.email, codigo: datosCliente.codigo, telefono: `${datosCliente.telefono.trim().replace(/\s+/g, '')}`, domain: document.location.href, _fbp, _fbc, ip: this.marketService.clientIp }
              };

              console.log('FbApi', action, allData);

              this.fbApiConv.sendFbApiEvent(allData).subscribe({
                next: (v) => { console.log('FbApi', action); },
                error: (e) => { console.log(e) }
              });

            }
          })
      }

    }

  }

  checkFbClid(): boolean { return (this.cookieService.get('_fbc') === '') ? false : true; }

  calcularPrecioDescuento(producto: any): number {
    let precio: number = 0;
    if (producto.descuento > 0) {
      precio = Math.round((producto.precio - ((producto.descuento / 100) * producto.precio)));
    } else { precio = producto.precio; }
    return Number(precio);
  }

  addToShoppingCart() {
    return {
      _id: this.producto._id,
      _idcart: new Date().getTime(), // Id para poder hacer la eliminacion del producto en el carrito
      descuento: { monto: 0, title: '', _iddiscount: '' },
      categories: this.producto.categories,
      sku: this.producto.inventario.sku,
      idfabrica: this.producto.inventario.idfabrica,
      idbarras: this.producto.inventario.idbarras,
      cantidad: 1,
      descripcion: this.producto.descripcion,
      precio: this.calcularPrecioDescuento(this.producto),
      precioTotal: this.calcularPrecioDescuento(this.producto),
      costo: this.producto.costo,
      variacion1: this.formClienteData.get('variacion1')?.value, // PENDIENTE EN NUEVO PEDIDO
      variacion2: this.formClienteData.get('variacion2')?.value, // PENDIENTE EN NUEVO PEDIDO
      title: this.producto.title,
      stock: 0,
      gestionarstock: this.producto.inventario.gestionarstock,
      img: this.producto.images[this.variacionImg]
    }
  }

  createPurchase() {

    // Si el formulario es invalido
    this.submitPedidoValidator = true;
    if (this.formClienteData.invalid) {

      Swal.fire({
        title: 'Upps ...',
        text: `Falta llenar campos obligatorios`,
        icon: 'error',
        confirmButtonText: 'Entiendo ...',
        confirmButtonColor: '#398bf7',
      });

      return;
    }

    const datosCliente: any = this.formClienteData.value
    const pedido = {
      cliente: {
        nombre: datosCliente.nombre,
        direccion: `${datosCliente.direccion} ${datosCliente.barrio}, ${datosCliente.ciudad} - ${datosCliente.departamento}`,
        codigo: datosCliente.codigo,
        telefono: `${datosCliente.telefono.trim().replace(/\s+/g, '')}`,
        documento: datosCliente.documento,
        email: datosCliente.email
      },
      articulos: [this.addToShoppingCart()],
      store: 'E-COMMERCE',
      tipoVenta: 'DETAL',
      plataformaPago: 'WHATSAPP',
      pago: 'CONTRA ENTREGA',
      estado: 'EN PROCESO',
      descuentoTotal: 0,
      descuentoPedido: 0,
      valorTotal: this.calcularPrecioDescuento(this.producto),
      utilidadTotal: 0,
      negocio: this.producto.negocio,
      wsnumber: this.wsnumber,
      lbsedes: [],
      loadBalancer: false,
      fbclid: this.checkFbClid(),
      funnel: true
    }


    this.submitPedido = true;
    this.marketService.nuevoPedido(pedido)
      .subscribe({
        next: (v) => this.pedidoHandler(v, pedido),
        error: (e) => this.stockErrorHandler(e, pedido)
      });

  }

  pedidoHandler(v: any, pedido: any) {
    // Pixel
    this.trackPixelPurchase(pixel, apiToken, (v.valorTotal - v.descuentoTotal), 'Purchase');
    this.marketService.analyticsUpsert(negocio, 'comprar').subscribe();

    this.submitPedido = false;
    this.submitPedidoValidator = false;

    // Cambiamos a la siguiente etapa (Validación de pedido)
    this.router.navigateByUrl(`cart/${v._id}`);

  }

  stockErrorHandler(e: any, pedido: any) {
    console.log(e);
  }

  @HostListener("window:scroll", ['$event'])
  doFilterlOnScroll($event: any) {
    if ((window.scrollY > Math.ceil(document.body.offsetHeight * 0.3)) && !this.sendViewContent) {
      this.marketService.trackPixel('ViewContent', this.producto);
      this.marketService.analyticsUpsert(negocio, 'vercontenido').subscribe();
      this.sendViewContent = true;
    }
  }

}
