import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { CustomTextFilterComponent } from './components/custom-text-filter/custom-text-filter.component';
import { ChatStatusBadgeComponent } from './components/chat-status-badge/chat-status-badge.component';
import { ActionCellRendererComponent } from './components/action-cell-renderer/action-cell-renderer.component';

interface ChatData {
  chatId: string;
  chatTopic: string;
  language: string;
  startDateTime: string;
  duration: string;
  chatStatus: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'AG-Grid Implementation - Chat Management';
  gridApi!: GridApi;

  // Column definitions matching Figma design
  columnDefs: ColDef[] = [
    {
      field: 'chatId',
      headerName: 'Chat ID',
      filter: 'agTextColumnFilter',
      minWidth: 150,
      sortable: true,
      cellClass: 'bold-cell'
    },
    {
      field: 'chatTopic',
      headerName: 'Chat Topic',
      filter: CustomTextFilterComponent,
      minWidth: 200,
      sortable: true
    },
    {
      field: 'language',
      headerName: 'Language',
      filter: 'agTextColumnFilter',
      minWidth: 120,
      sortable: true
    },
    {
      field: 'startDateTime',
      headerName: 'Start Date & Time',
      filter: 'agTextColumnFilter',
      minWidth: 180,
      sortable: true
    },
    {
      field: 'duration',
      headerName: 'Duration',
      filter: 'agTextColumnFilter',
      maxWidth: 120,
      sortable: true
    },
    {
      field: 'chatStatus',
      headerName: 'Chat Status',
      cellRenderer: ChatStatusBadgeComponent,
      filter: 'agTextColumnFilter',
      minWidth: 140,
      sortable: true
    },
    {
      headerName: '',
      cellRenderer: ActionCellRendererComponent,
      maxWidth: 80,
      sortable: false,
      filter: false,
      cellRendererParams: {
        onViewClick: (data: ChatData) => {
          console.log('View clicked for:', data);
          alert(`Viewing chat: ${data.chatId}`);
        }
      }
    }
  ];

  // Sample row data matching Figma design
  rowData: ChatData[] = [
    { chatId: 'C-2025091001', chatTopic: 'Resolved by bot', language: 'English', startDateTime: 'Sep 10, 2025 09:15', duration: '04:12', chatStatus: 'Resolved' },
    { chatId: 'C-2025091002', chatTopic: 'Resolved by Bot', language: 'English', startDateTime: 'Sep 10, 2025 09:15', duration: '04:12', chatStatus: 'Resolved' },
    { chatId: 'C-2025091003', chatTopic: 'Resolved by Bot', language: 'English', startDateTime: 'Sep 10, 2025 09:15', duration: '04:12', chatStatus: 'Resolved' },
    { chatId: 'C-2025091004', chatTopic: 'Resolved by Bot', language: 'English', startDateTime: 'Sep 10, 2025 09:15', duration: '04:12', chatStatus: 'Resolved' },
    { chatId: 'C-2025091005', chatTopic: 'Resolved by Bot', language: 'English', startDateTime: 'Sep 10, 2025 09:15', duration: '04:12', chatStatus: 'Resolved' },
    { chatId: 'C-2025091006', chatTopic: 'Resolved by Bot', language: 'English', startDateTime: 'Sep 10, 2025 09:15', duration: '04:12', chatStatus: 'Resolved' },
    { chatId: 'C-2025091007', chatTopic: 'Resolved by Bot', language: 'English', startDateTime: 'Sep 10, 2025 09:15', duration: '04:12', chatStatus: 'Resolved' },
    { chatId: 'C-2025091008', chatTopic: 'Pending review', language: 'Spanish', startDateTime: 'Sep 10, 2025 10:30', duration: '06:45', chatStatus: 'Pending' },
    { chatId: 'C-2025091009', chatTopic: 'In Progress', language: 'French', startDateTime: 'Sep 10, 2025 11:20', duration: '03:25', chatStatus: 'In Progress' },
    { chatId: 'C-2025091010', chatTopic: 'Resolved by Bot', language: 'English', startDateTime: 'Sep 10, 2025 12:05', duration: '05:15', chatStatus: 'Resolved' },
    { chatId: 'C-2025091011', chatTopic: 'Customer issue', language: 'German', startDateTime: 'Sep 10, 2025 13:45', duration: '08:30', chatStatus: 'Pending' },
    { chatId: 'C-2025091012', chatTopic: 'Resolved by Bot', language: 'English', startDateTime: 'Sep 10, 2025 14:10', duration: '02:50', chatStatus: 'Resolved' },
    { chatId: 'C-2025091013', chatTopic: 'Closed successfully', language: 'English', startDateTime: 'Sep 10, 2025 15:00', duration: '07:20', chatStatus: 'Closed' },
    { chatId: 'C-2025091014', chatTopic: 'Resolved by Bot', language: 'English', startDateTime: 'Sep 10, 2025 16:25', duration: '04:05', chatStatus: 'Resolved' },
    { chatId: 'C-2025091015', chatTopic: 'Technical support', language: 'Italian', startDateTime: 'Sep 10, 2025 17:15', duration: '09:15', chatStatus: 'In Progress' },
    { chatId: 'C-2025091016', chatTopic: 'Resolved by Bot', language: 'English', startDateTime: 'Sep 10, 2025 18:00', duration: '03:45', chatStatus: 'Resolved' },
  ];

  // Default grid options
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1
  };

  // Pagination settings
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 25, 50, 100];

  ngAfterViewInit() {
    // Grid API will be available after init
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    // Auto-size columns to fit content
    params.api.sizeColumnsToFit();
  }
}
