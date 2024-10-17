import { TestBed } from '@angular/core/testing';
import { CommonService } from './common.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('CommonService', () => {
  let service: CommonService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Import the HttpClientTestingModule
      providers: [CommonService], // Ensure CommonService is provided
    });

    service = TestBed.inject(CommonService);
    httpTestingController = TestBed.inject(HttpTestingController); // Inject the HttpTestingController
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch balancing circles', async () => {
    const mockResponse: any = []; 

    service.getBalancingCircles().then((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(
      `${service.baseUrl}/api/v1/balancing`
    );

    req.flush(mockResponse);
  });

  it('should fetch member forecast', async () => {
    const id = 1; 
    const mockForecastResponse = [{ date: '2024-01-01', value: 100 }];

    service.getMemberForecast(id).then((data) => {
      expect(data).toEqual(mockForecastResponse);
    });

    const req = httpTestingController.expectOne(
      `${service.baseUrl}/api/v1/balancing/member/${id}/forecast`
    );

    req.flush(mockForecastResponse);
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
