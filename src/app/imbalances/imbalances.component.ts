import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common.service';

@Component({
  selector: 'app-imbalances',
  templateUrl: './imbalances.component.html',
  styleUrls: ['./imbalances.component.css'],
})
export class ImbalancesComponent implements OnInit {
  balancing_circles: any[] = [];
  member_forecast: any[] = [];

  constructor(private _common: CommonService) {}

  ngOnInit(): void {
    debugger;
    console.log('ngOnInit called'); // Add this line
    this.getBalancingCircles();
    const id = '2579d34f-a547-4b2b-aa8d-552df1766cab';
    this.getMemberForecast(id);
  }

  async getBalancingCircles() {
    try {
      const response = await this._common.getBalancingCircles();
      console.log('API Response:', response); // Log the response
      this.balancing_circles = response;
    } catch (error) {
      console.error('Error fetching balancing circles:', error);
    }
  }

  async getMemberForecast(id: any) {
    debugger;
    try {
      // Pass the id directly to the service method
      const response = await this._common.getMemberForecast(id);
      console.log('API Response:', response); // Log the response
      this.member_forecast = response;
    } catch (error) {
      console.error('Error fetching balancing circles:', error);
    }
  }
}
