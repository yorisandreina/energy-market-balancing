import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImbalancesComponent } from './imbalances.component';
import { ChangeDetectorRef } from '@angular/core';
import { CommonService } from '../common.service';

describe('ImbalancesComponent', () => {
  let component: ImbalancesComponent;
  let fixture: ComponentFixture<ImbalancesComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let changeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    const commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'getBalancingCircles',
      'getMemberForecast',
    ]);
    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', [
      'detectChanges',
    ]);

    TestBed.configureTestingModule({
      declarations: [ImbalancesComponent],
      providers: [
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImbalancesComponent);
    component = fixture.componentInstance;
    commonService = TestBed.inject(
      CommonService
    ) as jasmine.SpyObj<CommonService>;
    changeDetectorRef = TestBed.inject(
      ChangeDetectorRef
    ) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getBalancingCircles and initializeChart', () => {
      spyOn(component, 'getBalancingCircles').and.callThrough();
      spyOn(component, 'initializeChart').and.callThrough();

      component.ngOnInit();

      expect(component.getBalancingCircles).toHaveBeenCalledWith(
        component.selectedDate
      );
      expect(component.initializeChart).toHaveBeenCalled();
    });
  });

  describe('getBalancingCircles', () => {
    beforeEach(() => {
      component.balancingCircles = [];
      component.datasets = [];
    });

    it('should gracefully handle errors when fetching balancing circles', async () => {
      const errorMessage = 'Error fetching data';
      commonService.getBalancingCircles.and.returnValue(
        Promise.reject(errorMessage)
      );

      const consoleErrorSpy = spyOn(console, 'error');

      await component.getBalancingCircles('2024-10-17');

      expect(component.balancingCircles).toEqual([]);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching balancing circles:',
        errorMessage
      );
    });
  });

  describe('addOneDay and subtractOneDay', () => {
    it('should add one day to the selectedDate', () => {
      component.date = new Date('2024-10-17');
      component.addOneDay();
      expect(component.selectedDate).toBe('2024-10-18');
    });

    it('should subtract one day from the selectedDate', () => {
      component.date = new Date('2024-10-17');
      component.subtractOneDay();
      expect(component.selectedDate).toBe('2024-10-16');
    });
  });
});
