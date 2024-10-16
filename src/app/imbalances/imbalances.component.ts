import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common.service';
import { Group, ImbalanceTime, Member } from 'src/interfaces/balancingCircle.interface';
import { Chart, ChartData, ChartType, Colors } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DefaultValueAccessor } from '@angular/forms';
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);

@Component({
  selector: 'app-imbalances',
  templateUrl: './imbalances.component.html',
  styleUrls: ['./imbalances.component.css'],
  // standalone: true,
  // imports: [BaseChartDirective]
})
export class ImbalancesComponent implements OnInit {
  balancingCircles: any[] = [];
  memberForecast: any[] = [];
  consumers: any[] = [];
  providers: any[] = [];
  groupBalancingCircle!: { groups: Group[] };

  selectedDate: any;

  labels: any;

  datasets: any[] = [];
  dataValues: any[] = [];
  values: any[] = [];
  hours: any[] = [];

  public lineChartData!: ChartData<'line'>;
  public lineChartLabels!: Array<String>;
  public lineChartOptions: any;
  public lineChartColors: any;
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';

  constructor(private _common: CommonService) {}

  ngOnInit(): void {
    debugger;
    console.log('ngOnInit called');
    this.getBalancingCircles(this.selectedDate);
  }

  initializeChart(): void {
    this.lineChartData = {
      labels: this.hours, // Put labels here
      datasets: this.datasets,
    };

    this.lineChartOptions = {
      maintainAspectRatio: true,
      responsive: true,
      elements: {
        point: {
          borderColor: Colors,
        }
      },
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Hours',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy units',
          },
        },
      },
      plugins: {
        zoom: {
          zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'x',
        },
        },
        legend: {
          position: "right",
          usePointStyle: true,
        }
      },
    };

    this.lineChartLegend = true;
    this.lineChartType = 'line';
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
          const memberObj: Member = {
            id: member.id,
            name: member.name,
            type: member.type,
            inflows: new Map<string, number>(),
            outflows: new Map<string, number>(),
          };

          const forecast = await this.getMemberForecast(
            member.id,
            selectedDate
          );

          for (let forecastData of forecast) {
            const time = forecastData.date.split('T')[1]; // Extract time
            const value =
              member.type === 'Producer'
                ? forecastData.value
                : -forecastData.value;

            if (member.type === 'Producer') {
              memberObj.inflows.set(time, value);
            } else if (member.type === 'Consumer') {
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

      // Calculate the imbalances and create datasets in one go
      this.datasets = [];
      this.hours = Array.from(
        { length: 24 },
        (_, hour) => `${String(hour).padStart(2, '0')}:00:00Z`
      );

      for (const group of groupData.groups) {
        const dailyImbalances: { date: string; imbalance: ImbalanceTime[] }[] =
          [];

        for (const member of group.members) {
          const transactions =
            member.type === 'Consumer' ? member.outflows : member.inflows;

          for (const [transactionTime, transactionValue] of transactions) {
            const hour = transactionTime.split(':')[0];
            let dateEntry = dailyImbalances.find(
              (entry) => entry.date === selectedDate
            );

            if (!dateEntry) {
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

        const values = dailyImbalances[0].imbalance.map((item) => item.value);
        this.datasets.push({
          data: values,
          label: group.groupName,
          fill: false,
        });
      }

      this.initializeChart();
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
