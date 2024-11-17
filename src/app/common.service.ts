import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

/*
PURPOSE: interact with backend APIs and retrieve data or, in other cases, send data.
        - allows for centralized HTTP requests that the app can access and reuse

lastValueFrom(): RxJS function that converts observable to promise allowing the handling of requests
in an async/await style for better integration with async workflows (async => await for the data to be available)

baseUrl: used to store the API endpoint Url. How can it be improved? by leveraging Angular's evironment files
to use it in development, staging and production environments

TESTING: these calls can be tested using httpTestingController

AUTHORIZATION: if endpoint requires authorization this can be modified through an Authorization header containing a token

HttpClient: make HTTP requests to backend servers or APIs and perform methods (delete, put, get, post)
*/

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  baseUrl: any;

  // TO DO: include the URL where the backend data is hosted or the local host
  constructor(public httpClient: HttpClient) {
    this.baseUrl = 'http://localhost:5295';
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
