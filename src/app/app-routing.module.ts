import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppConfiguracionComponent } from './components/app-configuracion/app-configuracion.component';

const routes: Routes = [
  { path: 'configuracion', component: AppConfiguracionComponent },
  { path: '', redirectTo: '/configuracion', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
