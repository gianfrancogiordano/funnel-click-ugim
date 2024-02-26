import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FbApiConversionService {

  constructor(private http: HttpClient) { }

  sendFbApiEvent(data: any) {

    return this.http.post(`${base_url}/fbapiconversion`, data)
      .pipe(
        map((resp: any) => resp.body)
      );

  }

}