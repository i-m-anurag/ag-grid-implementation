import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { CustomTextFilterComponent } from './components/custom-text-filter/custom-text-filter.component';
import { ChatStatusBadgeComponent } from './components/chat-status-badge/chat-status-badge.component';
import { ActionCellRendererComponent } from './components/action-cell-renderer/action-cell-renderer.component';
import { CustomSelectFilterComponent } from './components/custom-select-filter/custom-select-filter.component';
import { CustomDateFilterComponent } from './components/custom-date-filter/custom-date-filter.component';
import { PaginationConfig } from './components/custom-pagination/custom-pagination.component';
import { GridApiConfig } from './components/common-grid/common-grid.component';
import { CommonGridComponent } from './components/common-grid/common-grid.component';
import { CustomPaginationComponent } from './components/custom-pagination/custom-pagination.component';

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
  standalone: true,
  imports: [CommonModule, CommonGridComponent, CustomPaginationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'AG-Grid Implementation - Chat Management';
  gridApi!: GridApi;

  // Grid API Configuration
  gridApiConfig: GridApiConfig = {
    mode: 'client', // Switch to 'server' for API-based filtering
    debounceTime: 500, // Wait 500ms after last filter change before calling API
    // Map grid column names to API field names
    columnMapping: {
      'chatId': 'chat_id',
      'chatTopic': 'topic',
      'language': 'lang',
      'startDateTime': 'start_date_time',
      'duration': 'duration_seconds',
      'chatStatus': 'status'
    },
    // Callback when filters change (for server-side mode)
    onFilterChange: (filters: any) => {
      console.log('Filters changed (debounced):', filters);
      // Filters are already mapped using columnMapping by common-grid
      // Add your API call here to fetch filtered data
      /* 
      this.httpClient.post('/api/chats/filter', filters)
        .subscribe((response: any) => {
          this.rowData = response.data;
          // Hide loading after data received
          // Grid component will auto-hide after 5s if not manually hidden
        });
      */
    },
    // Callback when loading state changes
    onLoadingChange: (isLoading: boolean) => {
      console.log('Loading state:', isLoading);
      // You can update app-level loading state here if needed
    },
    // Transform API response to grid-compatible format
    onDataFetch: (response: any) => {
      // Transform API response if needed
      return response.data || response;
    }
  };

  // Pagination configuration
  paginationConfig: PaginationConfig = {
    mode: 'client', // 'client' or 'server'
    totalRecords: 0, // Set this when using server mode
    onPageChange: (page: number, pageSize: number) => {
      console.log(`Page changed to ${page}, page size: ${pageSize}`);
      // Add your server-side pagination API call here
    }
  };

  // Column definitions with custom filters
  columnDefs: ColDef[] = [
    {
      field: 'chatId',
      headerName: 'Chat ID',
      filter: CustomTextFilterComponent,
      filterParams: {
        placeholder: 'Filter Chat ID...',
        filterMode: 'client'
      },
      minWidth: 150,
      sortable: true,
      cellClass: 'bold-cell'
    },
    {
      field: 'chatTopic',
      headerName: 'Chat Topic',
      filter: CustomTextFilterComponent,
      filterParams: {
        placeholder: 'Filter topic...'
      },
      minWidth: 200,
      sortable: true
    },
    {
      field: 'language',
      headerName: 'Language',
      filter: CustomSelectFilterComponent,
      filterParams: {
        options: ['English', 'Arabic', 'Spanish', 'French', 'German', 'Italian'],
        variant: 'default',
        selectionMode: 'single' // Single selection for language
      },
      minWidth: 120,
      sortable: true
    },
    {
      field: 'startDateTime',
      headerName: 'Start Date & Time',
      filter: CustomDateFilterComponent,
      minWidth: 180,
      sortable: true
    },
    {
      field: 'duration',
      headerName: 'Duration',
      filter: CustomTextFilterComponent,
      filterParams: {
        placeholder: 'Filter duration'
      },
      maxWidth: 120,
      sortable: true
    },
    {
      field: 'chatStatus',
      headerName: 'Chat Status',
      cellRenderer: ChatStatusBadgeComponent,
      filter: CustomSelectFilterComponent,
      filterParams: {
        options: ['Resolved', 'Pending', 'In Progress', 'Closed'],
        variant: 'badge',
        selectionMode: 'multiple', // Multiple selection for status
        badgeColors: {
          'resolved': { bg: '#D1FAE5', text: '#059669' },
          'pending': { bg: '#FEF3C7', text: '#D97706' },
          'in progress': { bg: '#DBEAFE', text: '#2563EB' },
          'closed': { bg: '#E5E7EB', text: '#6B7280' }
        }
      },
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

  // Sample row data
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
