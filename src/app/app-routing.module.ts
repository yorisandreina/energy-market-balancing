import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImbalancesComponent } from './imbalances/imbalances.component';

const routes: Routes = [
  // automatically redirects user to imabalnces page for this purpose
  // but, in a fully developed website this typically include login or signup page
  { path: '', redirectTo: 'imbalances', pathMatch: 'full' },
  { path: 'imbalances', component: ImbalancesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
