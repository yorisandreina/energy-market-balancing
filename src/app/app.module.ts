import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { ImbalancesComponent } from './imbalances/imbalances.component';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { NgbModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [AppComponent, ImbalancesComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, NgChartsModule, NgbModule],
  providers: [NgbOffcanvas],
  bootstrap: [AppComponent],
})
export class AppModule {}
