import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonService } from '../common.service';
import { Group, ImbalanceTime, Member } from 'src/interfaces/balancingCircle.interface';
import { Chart, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DefaultValueAccessor } from '@angular/forms';
import zoomPlugin from 'chartjs-plugin-zoom';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
Chart.register(zoomPlugin);
import * as bootstrap from 'bootstrap';

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
    private offCanvasService: NgbOffcanvas,
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
        this.onChartClick(event, elements); // Bind the click event
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

  // Add this property to your component class
  selectedData: {
    label: string;
    value: number;
    groupName: string;
    members: [];
    date: any;
  } | null = null; // This will hold the data of the selected chart point


  onChartClick(event: MouseEvent, elements: any) {
    console.log('The data:', this.groupBalancingCircle);

    // Check if elements are present and if there's valid line chart data
    if (
      elements.length > 0 &&
      this.lineChartData &&
      this.lineChartData.labels
    ) {
      const dataPointIndex = elements[0].index; // Get the index of the clicked point
      const datasetIndex = elements[0].datasetIndex; // Get the dataset index of the clicked point

      console.log('This is the specific dataset:', this.lineChartData.datasets);

      // Get the label and data point based on the index
      const label = (this.lineChartData.labels[dataPointIndex] as string) || '';
      const dataPoint =
        (this.lineChartData.datasets[datasetIndex].data[
          dataPointIndex
        ] as number) || 0;
      const groupName = this.lineChartData.datasets[datasetIndex].label || '';
      const members =
        (this.lineChartData.datasets[datasetIndex] as any).members || [];

      // Initialize flowsMembers array
      const flowsMembers: any = [];

      // Extract the hour from the label
      const hour = label.split(':')[0]; // Assuming label is in "HH:mm:ssZ" format

      // Iterate over each member to find inflows or outflows for the extracted hour
      members.forEach((member: any) => {
        const memberName = member.name;

        // Check inflows for matching hour
        if (member.inflows && member.inflows.length > 0) {
          const matchingInflows = member.inflows.filter((inflow: any) => {
            // Assuming inflow has a 'date' property formatted as "YYYY-MM-DD HH:mm:ssZ"
            const inflowHour = inflow.date.split('T')[1].split(':')[0];
            return inflowHour === hour; // Match hour
          });

          // Store matching inflows
          matchingInflows.forEach((inflow: any) => {
            flowsMembers.push({
              name: memberName,
              flowType: 'inflow',
              value: inflow.value, // Assuming inflow has a 'value' property
            });
          });
        }

        // Check outflows for matching hour
        if (member.outflows && member.outflows.length > 0) {
          const matchingOutflows = member.outflows.filter((outflow: any) => {
            // Assuming outflow has a 'date' property formatted as "YYYY-MM-DD HH:mm:ssZ"
            const outflowHour = outflow.date.split('T')[1].split(':')[0];
            return outflowHour === hour; // Match hour
          });

          // Store matching outflows
          matchingOutflows.forEach((outflow: any) => {
            flowsMembers.push({
              name: memberName,
              flowType: 'outflow',
              value: outflow.value, // Assuming outflow has a 'value' property
            });
          });
        }
      });

      // Set selected data for displaying
      this.selectedData = {
        label: label,
        value: dataPoint,
        groupName: groupName,
        members: members,
        date: this.date
      };

      this.flowsMembers = flowsMembers;

      // Open the modal
      this.openDetailsModal();

      // Log selected data for debugging
      console.log('Selected Data:', this.selectedData);
      console.log('Flows Members Data:', this.flowsMembers);

      // Manually trigger change detection
      this.cdr.detectChanges();
    } else {
      // Reset selected data if no point is clicked
      this.selectedData = null;
    }
  }

  openDetailsModal() {
    const offcanvas = document.getElementById(
      'detailsOffcanvas'
    ) as HTMLElement;
    const bsOffcanvas = new bootstrap.Offcanvas(offcanvas);
    bsOffcanvas.show(); // Show the off-canvas
  }

  closeModal() {
    const offcanvas = document.getElementById(
      'detailsOffcanvas'
    ) as HTMLElement;
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
    if (bsOffcanvas) {
      bsOffcanvas.hide(); // Hide the off-canvas
    }
  }

  addOneDay() {
    const newDate = new Date(this.date); // Convert string date to Date object
    newDate.setDate(newDate.getDate() + 1); // Add one day

    // Format the date back to a string in 'YYYY-MM-DD' format
    this.selectedDate = newDate.toISOString().split('T')[0];

    this.getBalancingCircles(this.selectedDate);
  }

  subtractOneDay() {
    const newDate = new Date(this.date); // Convert string date to Date object
    newDate.setDate(newDate.getDate() - 1); // Add one day

    // Format the date back to a string in 'YYYY-MM-DD' format
    this.selectedDate = newDate.toISOString().split('T')[0];

    this.getBalancingCircles(this.selectedDate);
  }

  async getBalancingCircles(selectedDate: any) {
    this.emptyStateDate = selectedDate == '' ? true : false;
    console.log(selectedDate);
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

          if (!selectedDate && forecast.length > 0) {
            this.date = forecast[0].date.split('T')[0];
          } else {
            this.date = selectedDate;
          }

          for (let forecastData of forecast) {
            const fullDate = forecastData.date;
            const value =
              member.type === 'Producer'
                ? forecastData.value
                : -forecastData?.value;

            // Store inflows and outflows based on type
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

      // Reset datasets for each group to avoid summing previous values
      this.datasets = [];
      this.hours = Array.from(
        { length: 24 },
        (_, hour) => `${String(hour).padStart(2, '0')}:00:00Z`
      );

      // Process each group separately to calculate daily imbalances
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

          // Ensure selectedDate comparison is done correctly
          const lastTransactionDate: any = Array.from(transactions.keys())
            .pop()
            ?.split('T')[0];

          if (selectedDate && selectedDate > lastTransactionDate) {
            this.emptyState = true;
            return;
          } else {
            this.emptyState = false;
          }

          // Only process transactions for the correct date scope
          for (const [transactionTime, transactionValue] of transactions) {
            const transactionDate = transactionTime.split('T')[0];
            const hour = transactionTime.split('T')[1].split(':')[0];

            // Ensure we process the correct date only
            if (selectedDate && transactionDate !== selectedDate) continue;

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

        // Create dataset entry for the group, including member details
        if (dailyImbalances.length > 0) {
          const values = dailyImbalances[0].imbalance.map((item) => item.value);

          // Collect inflow and outflow data for each member
          const memberData = group.members.map((member) => {
            if (selectedDate == '') {
              selectedDate = this.date;
            }
            const inflowsForDate = Array.from(member.inflows)
              .filter(([date]) => date.startsWith(selectedDate))
              .map(([date, value]) => ({ date, value }));
            const outflowsForDate = Array.from(member.outflows)
              .filter(([date]) => date.startsWith(selectedDate))
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
            members: memberData, // Include member data
          });
        }
      }

      console.log('Final Datasets:', this.datasets);
      this.initializeChart();
      console.timeEnd('getBalancingCircles');
    } catch (error) {
      console.error('Error fetching balancing circles:', error);
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

  // async calculateDailyImbalances(
  //   groups: Group[],
  //   selectedDate: any
  // ): Promise<void> {
  //   debugger;
  //   for (const group of groups) {
  //     const dailyImbalances: { date: string; imbalance: ImbalanceTime[] }[] =
  //       [];

  //     for (const member of group.members) {
  //       // Access inflows or outflows based on member type
  //       const transactions =
  //         member.type === 'Consumer' ? member.outflows : member.inflows;

  //       // Iterate over transactions to calculate daily imbalances
  //       for (const [transactionTime, transactionValue] of transactions) {
  //         const hour = transactionTime.split(':')[0]; // Get the hour part (HH)

  //         // Find or create the date entry for the selectedDate
  //         let dateEntry = dailyImbalances.find(
  //           (entry) => entry.date === selectedDate
  //         );
  //         if (!dateEntry) {
  //           // Initialize the 24-hour imbalance structure for the selected date
  //           dateEntry = {
  //             date: selectedDate,
  //             imbalance: Array.from({ length: 24 }, (_, hour) => ({
  //               time: `${String(hour).padStart(2, '0')}:00:00Z`,
  //               value: 0,
  //             })),
  //           };
  //           dailyImbalances.push(dateEntry);
  //         }

  //         dateEntry.imbalance[parseInt(hour)].value += transactionValue;
  //       }
  //     }

  //     group.imbalances = dailyImbalances;
  //   }
  // }
}
