import { Component, AfterViewInit, ViewChild } from '@angular/core';
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

  @ViewChild(CommonGridComponent) gridComponent!: CommonGridComponent;

  // Pagination state
  currentOffset: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  gridApiConfig: GridApiConfig = {
    mode: 'server', // Server-side filtering enabled for mixed mode
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
      // Structure example:
      // {
      //   chat_id: { filterType: 'text', filter: 'C-2025' },
      //   lang: { filterType: 'select', options: ['English', 'Spanish'] },
      //   start_date_time: { filterType: 'date', date: '2025-09-10', timeFrom: '09:00', timeTo: '17:00' }
      // }

      // Process each filter by type
      Object.keys(filters).forEach(fieldName => {
        const filterModel = filters[fieldName];

        switch (filterModel.filterType) {
          case 'text':
            console.log(`Text filter on ${fieldName}: "${filterModel.filter}"`);
            break;
          case 'select':
            console.log(`Select filter on ${fieldName}:`, filterModel.options);
            break;
          case 'date':
            console.log(`Date filter on ${fieldName}:`, {
              date: filterModel.date,
              timeFrom: filterModel.timeFrom,
              timeTo: filterModel.timeTo
            });
            break;
        }
      });

      // Example: Make API call with all active filters
      /* 
      // Reset pagination to first page when filters change
      this.currentOffset = 0;
      this.fetchDataWithPagination(0, this.pageSize);
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
    mode: 'server',
    totalRecords: 0,
    currentOffset: 0,
    onPageChange: (offset: number, limit: number) => {
      console.log(`Pagination changed - offset: ${offset}, limit: ${limit}`);

      // Update local state
      this.currentOffset = offset;
      this.pageSize = limit;

      // Fetch data with current filters and new pagination
      this.fetchDataWithPagination(offset, limit);
    }
  };

  constructor() {
    // Test scenario: setLoading called BEFORE grid is ready
    console.log('Setting loading state before grid is ready...');

    // Simulate calling setLoading before grid mounts (e.g., API call starts immediately)
    setTimeout(() => {
      this.gridComponent?.setLoading(true);
    }, 0);

    // Simulate data arriving after delay
    setTimeout(() => {
      console.log('Async data received! Updating total records...');
      this.paginationConfig = {
        ...this.paginationConfig,
        totalRecords: 156
      };
      // Load the first page of data
      this.fetchDataWithPagination(0, 10);
    }, 3000); // 3 second delay to see skeleton loader
  }

  fetchDataWithPagination(offset: number, limit: number) {
    console.log(`Fetching data with offset: ${offset}, limit: ${limit}`);

    // Get current active filters from grid
    const filters = this.gridComponent?.getActiveFilters() || {};

    // Example: Simulate API call with timeout (replace with actual API call)
    this.gridComponent?.setLoading(true);

    // Simulate API response
    setTimeout(() => {
      // Calculate which slice of data to show based on offset and limit
      const startIndex = offset;
      const endIndex = offset + limit;
      const paginatedData = this.rowData.slice(startIndex, endIndex);

      // Create a new array reference for change detection
      const newData = [...paginatedData];

      // Update grid data using the grid component method
      if (this.gridComponent) {
        this.gridComponent.updateGridData(newData, limit);
        this.gridComponent.setLoading(false);
      }

      // Update pagination state
      this.totalRecords = this.rowData.length;
      this.currentOffset = offset;

      // Update pagination config with new object reference
      this.paginationConfig = {
        ...this.paginationConfig,
        totalRecords: this.totalRecords,
        currentOffset: this.currentOffset
      };

      console.log(`Updated grid with ${newData.length} records (offset: ${offset}, limit: ${limit})`);
    }, 2000); // 2 second delay

    // =====================================================
    // REFERENCE: No Data Overlay Example
    // Uncomment below to test No Data overlay
    // =====================================================
    /*
    setTimeout(() => {
      if (this.gridComponent) {
        this.gridComponent.updateGridData([], limit);  // Empty array triggers No Data overlay
        this.gridComponent.setLoading(false);
      }
    }, 2000);
    */

    // =====================================================
    // REFERENCE: Error Overlay Example
    // Uncomment below to test Error overlay
    // =====================================================
    /*
    setTimeout(() => {
      if (this.gridComponent) {
        this.gridComponent.setError(
          'Server Error: Unable to fetch data. Please try again later.',
          () => {
            // Retry callback - called when user clicks Retry button
            console.log('Retrying...');
            this.fetchDataWithPagination(offset, limit);
          }
        );
      }
    }, 3000);
    */

    // Example API call structure:
    /* 
    this.gridComponent.setLoading(true);
    
    const payload = {
      ...filters,  // Include all active filters
      offset: offset,
      limit: limit
    };
    
    this.httpClient.post('/api/chats', payload)
      .subscribe({
        next: (response: any) => {
          // IMPORTANT: Create new array reference for change detection
          this.rowData = [...response.data];
          
          // Update grid data explicitly with the new page size
          this.gridComponent.updateGridData(this.rowData, limit);
          
          // Update pagination state from API response
          this.totalRecords = response.totalRecords;
          this.currentOffset = response.offset || offset;
          
          // Update pagination config to reflect new state
          this.paginationConfig = {
            ...this.paginationConfig,
            totalRecords: this.totalRecords,
            currentOffset: this.currentOffset
          };
          
          this.gridComponent.setLoading(false);
        },
        error: (error) => {
          console.error('API error:', error);
          this.gridComponent.setLoading(false);
        }
      });
    */
  }

  // Column definitions with custom filters
  columnDefs: ColDef[] = [
    {
      field: 'chatId',
      headerName: 'Chat ID',
      filter: CustomTextFilterComponent,
      filterParams: {
        placeholder: 'Filter Chat ID...',
        filterMode: 'server', // 👈 Triggers API
        filterType: 'text'
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
        placeholder: 'Filter topic...',
        filterMode: 'client',
        filterType: 'text'
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
        selectionMode: 'single',
        filterMode: 'client', // 👈 Filters locally
        filterType: 'select'
      },
      minWidth: 120,
      sortable: true
    },
    {
      field: 'startDateTime',
      headerName: 'Start Date & Time',
      filter: CustomDateFilterComponent,
      filterParams: {
        filterMode: 'client',
        filterType: 'date'
      },
      minWidth: 180,
      sortable: true
    },
    {
      field: 'duration',
      headerName: 'Duration',
      filter: CustomTextFilterComponent,
      filterParams: {
        placeholder: 'Filter duration',
        filterMode: 'client',
        filterType: 'text'
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
        selectionMode: 'multiple',
        filterMode: 'server', // 👈 Triggers API
        filterType: 'select',
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
