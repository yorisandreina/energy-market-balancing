import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  baseUrl: any;

  // TO DO: include the URL where the backend data is hosted or the local host
  constructor(public httpClient: HttpClient) {
    this.baseUrl = '';
  }

  getBalancingCircles(): Promise<any[]> {
    const headers = { 'Content-Type': 'application/json' };
    const request = {};

    return lastValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/api/v1/balancing`, {
        headers,
        params: request,
      })
    );
  }

  getMemberForecast(id: any): Promise<any[]> {
    const headers = { 'Content-Type': 'application/json' };
    const request = {};

    return lastValueFrom(
      this.httpClient.get<any[]>(
        `${this.baseUrl}/api/v1/balancing/member/${id}/forecast`,
        {
          headers,
          params: request,
        }
      )
    );
  }
}
