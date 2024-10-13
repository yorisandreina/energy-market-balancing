import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImbalancesComponent } from './imbalances.component';

describe('ImbalancesComponent', () => {
  let component: ImbalancesComponent;
  let fixture: ComponentFixture<ImbalancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImbalancesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImbalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
