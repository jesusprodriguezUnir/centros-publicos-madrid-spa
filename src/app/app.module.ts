// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    NgxPaginationModule, // Asegúrate de que este módulo esté importado
    AppComponent
  ],
  providers: [],
   bootstrap: [AppComponent]
})
export class AppModule { }
