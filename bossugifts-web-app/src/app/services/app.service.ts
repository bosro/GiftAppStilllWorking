import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  catchError,
  map,
  of,
  take,
  tap,
} from 'rxjs';
import { baseurl } from '../ocnstants/api';

@Injectable({ providedIn: 'root' })
export class AppService {
  constructor(private http: HttpClient) {}

  getCategory(): Observable<any> {
    return this.http.get(`${baseurl}/cards/category/get`).pipe(
      take(1),
      catchError((err) => of(err)),
      tap((res) => {
        if (!res.success) {
          throw Error(res.message);
        }
      }),
      map((res) => res.data)
    );
  }

  getCards(id: string): Observable<any> {
    return this.http.get(`${baseurl}/cards/category/active/${id}`).pipe(
      take(1),
      catchError((err) => of(err)),
      tap((res) => {
        if (!res.success) {
          throw Error(res.message);
        }
      }),
      map((res) => res.data)
    );
  }

  async order(data: any, token: string): Promise<any> {
    const res = await fetch(`${baseurl}/cards/purchase`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  calculatePrice(data: any): Observable<any> {
    return this.http.post(`${baseurl}/cards/calculate-price`, data).pipe(
      take(1),
      catchError((err) => of(err)),
      tap((res) => {
        if (!res.success) {
          throw Error(res.message);
        }
      }),
      map((res) => res.data?.convertedAmount)
    );
  }

  onboard(data: any): Observable<any> {
    return this.http.post(`${baseurl}/customers/onboard-token`, data).pipe(
      take(1),
      catchError((err) => of(err)),
      tap((res) => {
        if (!res.success) {
          throw Error(res.message);
        }
      }),
      map((res) => Object.assign({}, res.data, { token: res.token }))
    );
  }
}
