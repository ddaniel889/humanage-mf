import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveRequestDetailComponent } from './leave-request-detail.component';


const routes: Routes = [
  {
    path: '',
    component: LeaveRequestDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveRequestDetailRoutingModule { }
