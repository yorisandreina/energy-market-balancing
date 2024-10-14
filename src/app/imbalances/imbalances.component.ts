import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common.service';
import { Group, ImbalanceTime, Member } from 'src/interfaces/balancingCircle.interface';

@Component({
  selector: 'app-imbalances',
  templateUrl: './imbalances.component.html',
  styleUrls: ['./imbalances.component.css'],
})
export class ImbalancesComponent implements OnInit {
  balancingCircles: any[] = [];
  memberForecast: any[] = [];
  consumers: any[] = [];
  providers: any[] = [];
  groupBalancingCircle!: { groups: Group[] };

  selectedDate: any;

  constructor(private _common: CommonService) {}

  ngOnInit(): void {
    debugger;
    console.log('ngOnInit called'); // Add this line
  }

  async getBalancingCircles(selectedDate: string) {
    console.time('getBalancingCircles');
    try {
      const response = await this._common.getBalancingCircles();
      this.balancingCircles = response;

      const groupData: { groups: Group[] } = { groups: [] };

      for (let group of this.balancingCircles) {
        const groupObj: Group = {
          groupName: group.name,
          imbalances: [],
          members: [],
        };

        const memberPromises = group.members.map(async (member: any) => {
          // Initialize member object with empty inflows and outflows
          const memberObj: Member = {
            id: member.id,
            name: member.name,
            type: member.type,
            inflows: new Map<string, number>(), // Reset inflows
            outflows: new Map<string, number>(), // Reset outflows
          };

          // Fetch forecast data for the specific selectedDate
          const forecast = await this.getMemberForecast(
            member.id,
            selectedDate
          );


          

          for (let forecastData of forecast) {
            const time = forecastData.date.split('T')[1]; // Extract time (HH:MM:SS)
            const value =
              member.type === 'Producer'
                ? forecastData.value
                : -forecastData.value;

  

            // Store inflows and outflows directly
            if (member.type === 'Producer') {;
              memberObj.inflows.set(time, value);
    
            } else if (member.type === 'Consumer') {
              // const currentValue = memberObj.outflows.get(time) || 0;
              memberObj.outflows.set(time, value);
    
            }
          }

          return memberObj;
        });

        groupObj.members = await Promise.all(memberPromises);
        groupData.groups.push(groupObj);
      }

      this.groupBalancingCircle = groupData;
      console.log('Organized Data Structure:', this.groupBalancingCircle);

      // Calculate the imbalances for the selectedDate
      await this.calculateDailyImbalances(groupData.groups, selectedDate);
      console.timeEnd('getBalancingCircles');
    } catch (error) {
      console.error('Error fetching balancing circles:', error);
    }
  }

  async calculateDailyImbalances(
    groups: Group[],
    selectedDate: string
  ): Promise<void> {
    for (const group of groups) {
      const dailyImbalances: { date: string; imbalance: ImbalanceTime[] }[] =
        [];

      for (const member of group.members) {
        // Access inflows or outflows based on member type
        const transactions =
          member.type === 'Consumer' ? member.outflows : member.inflows;


        // Iterate over transactions to calculate daily imbalances
        for (const [transactionTime, transactionValue] of transactions) {
          const hour = transactionTime.split(':')[0]; // Get the hour part (HH)

          // Find or create the date entry for the selectedDate
          let dateEntry = dailyImbalances.find(
            (entry) => entry.date === selectedDate
          );
          if (!dateEntry) {
            // Initialize the 24-hour imbalance structure for the selected date
            dateEntry = {
              date: selectedDate,
              imbalance: Array.from({ length: 24 }, (_, hour) => ({
                time: `${String(hour).padStart(2, '0')}:00:00Z`,
                value: 0,
              })),
            };
            dailyImbalances.push(dateEntry);
          }



          dateEntry.imbalance[parseInt(hour)].value += transactionValue;
        }
      }

      group.imbalances = dailyImbalances;
    }
  }

  async getMemberForecast(id: any, params: any) {
    try {
      const response: any = await this._common.getMemberForecast(id, params);
      return response.forecast; // Assuming the forecast is returned as an array
    } catch (error) {
      console.error('Error fetching member forecast:', error);
      return [];
    }
  }
}
