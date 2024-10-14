import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  baseUrl: any;

  constructor(public httpClient: HttpClient) {
    this.baseUrl = 'http://localhost:5295';
  }

  getBalancingCircles(): Promise<any[]> {
    const headers = { 'Content-Type': 'application/json' };
    const request = {};

    // Return the Promise from the HTTP request
    return lastValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/api/v1/balancing`, {
        headers,
        params: request,
      })
    );
  }

  getMemberForecast(id: any, params: any): Promise<any[]> {
    const headers = { 'Content-Type': 'application/json' };
    const request = {};

    // Return the Promise from the HTTP request
    return lastValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/api/v1/balancing/member/${id}/forecast?date=`+ params, {
        headers,
        params: request,
      })
    );
  }
}
