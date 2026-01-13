import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgGridModule } from 'ag-grid-angular';

import { AppComponent } from './app.component';
import { CommonGridComponent } from './components/common-grid/common-grid.component';
import { CustomTextFilterComponent } from './components/custom-text-filter/custom-text-filter.component';

@NgModule({
  declarations: [
    AppComponent,
    CommonGridComponent,
    CustomTextFilterComponent
  ],
  imports: [
    BrowserModule,
    AgGridModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
