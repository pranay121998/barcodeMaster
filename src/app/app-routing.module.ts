import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BulkComponent } from './bulk/bulk.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GenerateComponent } from './generate/generate.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { PendingComponent } from './pending/pending.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { RecallComponent } from './recall/recall.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'menu',
    component: MenuComponent
  },
  {
    path: 'bulk',
    component: BulkComponent
  },
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: 'generate',
    component: GenerateComponent
  },
  {
    path: 'permission',
    component: PermissionsComponent
  },
  {
    path: 'pending',
    component: PendingComponent
  },
  {
    path: 'recall',
    component: RecallComponent
  }
];
// imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: ‘reload’})],

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,
    scrollPositionRestoration: 'enabled', // Add options right here
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
