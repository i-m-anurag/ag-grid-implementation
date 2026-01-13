import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';

import { AppComponent } from './app.component';
import { CommonGridComponent } from './components/common-grid/common-grid.component';
import { CustomTextFilterComponent } from './components/custom-text-filter/custom-text-filter.component';
import { ChatStatusBadgeComponent } from './components/chat-status-badge/chat-status-badge.component';
import { ActionCellRendererComponent } from './components/action-cell-renderer/action-cell-renderer.component';
import { CustomPaginationComponent } from './components/custom-pagination/custom-pagination.component';
import { CustomSelectFilterComponent } from './components/custom-select-filter/custom-select-filter.component';
import { CustomDateFilterComponent } from './components/custom-date-filter/custom-date-filter.component';

@NgModule({
  declarations: [
    AppComponent,
    CommonGridComponent,
    CustomTextFilterComponent,
    ChatStatusBadgeComponent,
    ActionCellRendererComponent,
    CustomPaginationComponent,
    CustomSelectFilterComponent,
    CustomDateFilterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AgGridModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
