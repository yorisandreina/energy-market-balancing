import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImbalancesComponent } from './imbalances/imbalances.component';

const routes: Routes = [
  { path: '' },  // Redirect root to 'balancing-circles'
  { path: 'balancing-circles', component: ImbalancesComponent }, 
]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
