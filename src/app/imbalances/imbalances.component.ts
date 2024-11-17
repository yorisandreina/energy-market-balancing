import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonService } from '../common.service';
import { Group, ImbalanceTime, Member } from 'src/interfaces/balancingCircle.interface';
import { Chart, ChartData, ChartType } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
Chart.register(zoomPlugin);
import * as bootstrap from 'bootstrap';

/*
Considerations for improvements:
* Defining constants for repeated strings
* Responsiveness of the webpage could be improved for more style precision
* Improve error handling to correctly inform user and provide feedback
* Improve loading states and empty states in components
* Optimization of async operations -> although the time to execute the getBalancingCircles method is kept in the low 100 ms range, it could be optimized in terms of loops and data structures
* It could be tested if separating tasks into methods leads to more optimal results, although based on the task and endpoints provided, curretn data handling seemed a good fit
* Lastly, if I had focused more on the backend aspect of the task, I would have created optimized queries for faster, more accurate, and simpler data fetching instead of relying heavily on the frontend. 
  This approach would allow for better error handling on the backend, reducing the risk of a poor user experience. 
*/

/*
RESPONSIBILITIES: fetch and process balancing circle data, initialize and manage line chart, hadling date selection and navigation, managing details modal

ChangeDetectorRef: trigger Angular's change detection manually so UI updates immediately
specially useful for scenarios where the default change detection may not catch data changes  

OPTIMIZATION: lazy loading, caching to reduce repeated API calls

TESTING: mock service and useful methods

BAKCEND: database aggregation pipelines, limit data,
*/

@Component({
  selector: 'app-imbalances',
  templateUrl: './imbalances.component.html',
  styleUrls: ['./imbalances.component.css'],
})
export class ImbalancesComponent implements OnInit {
  static getBalancingCircles() {
    throw new Error('Method not implemented.');
  }
  static errorHandler(errorHandler: any) {
    throw new Error('Method not implemented.');
  }
  static isError(isError: any) {
    throw new Error('Method not implemented.');
  }
  balancingCircles: any[] = [];
  memberForecast: any[] = [];
  consumers: any[] = [];
  providers: any[] = [];
  groupBalancingCircle!: { groups: Group[] };

  selectedDate: any = '';
  date: any;
  storedDate: any;

  labels: any;
  flowsMembers: any[] = [];

  emptyState = true;
  emptyStateDate: boolean = true;

  datasets: any[] = [];
  dataValues: any[] = [];
  values: any[] = [];
  hours: any[] = [];

  showModal = false;

  public lineChartData!: ChartData<'line'>;
  public lineChartLabels!: Array<String>;
  public lineChartOptions: any;
  public lineChartColors: any;
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';

  @ViewChild('detailsTemplate') detailsTemplate!: TemplateRef<any>;

  constructor(
    private _common: CommonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    debugger;
    console.log('ngOnInit called');
    this.getBalancingCircles(this.selectedDate);
    this.initializeChart();
    const date = Date();
    console.log(date);
  }

  initializeChart(): void {
    this.lineChartData = {
      labels: this.hours,
      datasets: this.datasets,
    };

    this.lineChartOptions = {
      maintainAspectRatio: true,
      responsive: true,
      onClick: (event: MouseEvent, elements: any[]) => {
        this.onChartClick(event, elements); // Click event for point in chart
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
        tooltip: {},
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: 'x',
          },
        },
        legend: {
          position: 'top',
          usePointStyle: true,
        },
      },
    };

    this.lineChartLegend = true;
    this.lineChartType = 'line';
  }

  selectedData: {
    label: string;
    value: number;
    groupName: string;
    members: [];
    date: any;
  } | null = null; // Hold the data of the selected chart point

  onChartClick(event: MouseEvent, elements: any) {
    if (
      elements.length > 0 &&
      this.lineChartData &&
      this.lineChartData.labels
    ) {
      const dataPointIndex = elements[0].index; // Index of the clicked point
      const datasetIndex = elements[0].datasetIndex; // Dataset index of the clicked point

      const label = (this.lineChartData.labels[dataPointIndex] as string) || '';
      const dataPoint =
        (this.lineChartData.datasets[datasetIndex].data[
          dataPointIndex
        ] as number) || 0;
      const groupName = this.lineChartData.datasets[datasetIndex].label || '';
      const members =
        (this.lineChartData.datasets[datasetIndex] as any).members || [];

      const flowsMembers: any = [];

      // Extract the hour from the label
      const hour = label.split(':')[0];

      // Iterate over each member to find inflows or outflows for the extracted hour
      members.forEach((member: any) => {
        const memberName = member.name;

        // Match hour to inflow
        if (member.inflows && member.inflows.length > 0) {
          const matchingInflows = member.inflows.filter((inflow: any) => {
            const inflowHour = inflow.date.split('T')[1].split(':')[0];
            return inflowHour === hour; // Match hour
          });

          // Store matching inflows
          matchingInflows.forEach((inflow: any) => {
            flowsMembers.push({
              name: memberName,
              flowType: 'inflow',
              value: inflow.value,
            });
          });
        }

        // Match hour to outflows
        if (member.outflows && member.outflows.length > 0) {
          const matchingOutflows = member.outflows.filter((outflow: any) => {
            const outflowHour = outflow.date.split('T')[1].split(':')[0];
            return outflowHour === hour; // Match hour
          });

          // Store matching outflows
          matchingOutflows.forEach((outflow: any) => {
            flowsMembers.push({
              name: memberName,
              flowType: 'outflow',
              value: outflow.value,
            });
          });
        }
      });

      // Data to be displayed
      this.selectedData = {
        label: label,
        value: dataPoint,
        groupName: groupName,
        members: members,
        date: this.date,
      };

      this.flowsMembers = flowsMembers;

      this.openDetailsModal();

      // Log selected data for debugging
      console.log('Selected Data:', this.selectedData);
      console.log('Flows Members Data:', this.flowsMembers);

      // Trigger change detection to avoid empty data sets
      this.cdr.detectChanges();
    } else {
      this.selectedData = null;
    }
  }

  openDetailsModal() {
    const offcanvas = document.getElementById(
      'detailsOffcanvas'
    ) as HTMLElement;
    const bsOffcanvas = new bootstrap.Offcanvas(offcanvas);
    bsOffcanvas.show();
  }

  closeModal() {
    const offcanvas = document.getElementById(
      'detailsOffcanvas'
    ) as HTMLElement;
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
    if (bsOffcanvas) {
      bsOffcanvas.hide();
    }
  }

  addOneDay() {
    const newDate = new Date(this.date);
    newDate.setDate(newDate.getDate() + 1);

    this.selectedDate = newDate.toISOString().split('T')[0];

    this.getBalancingCircles(this.selectedDate);
  }

  subtractOneDay() {
    const newDate = new Date(this.date);
    newDate.setDate(newDate.getDate() - 1);

    this.selectedDate = newDate.toISOString().split('T')[0];

    this.getBalancingCircles(this.selectedDate);
  }

  async getBalancingCircles(selectedDate: any) {
    this.emptyStateDate = selectedDate === '' ? true : false;

    try {
      const response = await this._common.getBalancingCircles();
      this.balancingCircles = response;

      const groupData: { groups: Group[] } = { groups: [] };

      // Set the date once, based on selectedDate or the first forecast date
      let finalSelectedDate = selectedDate;

      // Loop through each group to process data
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
          );

          // Determine the date only once based on the first forecast, if not selectedDate
          if (!finalSelectedDate && forecast.length > 0) {
            finalSelectedDate = forecast[0].date.split('T')[0];
            this.date = finalSelectedDate;
          } else {
            this.date = finalSelectedDate;
          }

          // Process forecast data
          for (let forecastData of forecast) {
            const fullDate = forecastData.date;
            const value =
              member.type === 'Producer'
                ? forecastData.value
                : -forecastData?.value;

            if (member.type === 'Producer') {
              memberObj.inflows.set(fullDate, value);
            } else if (member.type === 'Consumer') {
              memberObj.outflows.set(fullDate, value);
            }
          }

          return memberObj;
        });

        groupObj.members = await Promise.all(memberPromises);
        groupData.groups.push(groupObj);
      }

      this.groupBalancingCircle = groupData;
      console.log('Organized Data Structure:', this.groupBalancingCircle);

      // Reset datasets for each group
      this.datasets = [];
      this.hours = Array.from(
        { length: 24 },
        (_, hour) => `${String(hour).padStart(2, '0')}:00:00Z`
      );

      // Process each group for daily imbalances
      for (const group of groupData.groups) {
        const dailyImbalances: { date: string; imbalance: ImbalanceTime[] }[] =
          [];

        for (const member of group.members) {
          const transactions =
            member.type === 'Consumer' ? member.outflows : member.inflows;

          if (transactions.size === 0) {
            this.emptyState = true;
            continue;
          }

          const lastTransactionDate: any = Array.from(transactions.keys())
            .pop()
            ?.split('T')[0];

          // Use the finalSelectedDate for comparison
          if (finalSelectedDate && finalSelectedDate > lastTransactionDate) {
            this.emptyState = true;
            return;
          } else {
            this.emptyState = false;
          }

          // Process transactions for the correct date
          for (const [transactionTime, transactionValue] of transactions) {
            const transactionDate = transactionTime.split('T')[0];
            const hour = transactionTime.split('T')[1].split(':')[0];

            if (finalSelectedDate && transactionDate !== finalSelectedDate)
              continue;

            let dateEntry = dailyImbalances.find(
              (entry) => entry.date === transactionDate
            );

            if (!dateEntry) {
              dateEntry = {
                date: transactionDate,
                imbalance: Array.from({ length: 24 }, (_, hour) => ({
                  time: `${String(hour).padStart(2, '0')}:00:00Z`,
                  value: 0,
                })),
              };
              dailyImbalances.push(dateEntry);
            }

            // Update the imbalance value for the specific hour
            dateEntry.imbalance[parseInt(hour)].value += transactionValue;
          }
        }

        group.imbalances = dailyImbalances;

        if (dailyImbalances.length > 0) {
          const values = dailyImbalances[0].imbalance.map((item) => item.value);

          const memberData = group.members.map((member) => {
            const inflowsForDate = Array.from(member.inflows)
              .filter(([date]) => date.startsWith(finalSelectedDate))
              .map(([date, value]) => ({ date, value }));
            const outflowsForDate = Array.from(member.outflows)
              .filter(([date]) => date.startsWith(finalSelectedDate))
              .map(([date, value]) => ({ date, value }));

            return {
              id: member.id,
              name: member.name,
              inflows: inflowsForDate,
              outflows: outflowsForDate,
            };
          });

          this.datasets.push({
            data: values,
            label: group.groupName,
            fill: false,
            members: memberData,
          });
        }
      }

      this.initializeChart();
    } catch (error) {
      console.error('Error fetching balancing circles:', error);
    }
  }

  async getMemberForecast(id: any) {
    try {
      const response: any = await this._common.getMemberForecast(id);
      return response.forecast;
    } catch (error) {
      console.error('Error fetching member forecast:', error);
      return [];
    }
  }
}
