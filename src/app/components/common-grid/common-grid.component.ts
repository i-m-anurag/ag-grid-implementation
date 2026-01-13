import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';

export interface GridApiConfig {
    mode?: 'client' | 'server'; // Client-side or server-side data
    filterUrl?: string; // API endpoint for filtering
    paginationUrl?: string; // API endpoint for pagination
    dataUrl?: string; // API endpoint for initial data load
    columnMapping?: { [key: string]: string }; // Map grid column field to API field names
    onFilterChange?: (filters: any) => void; // Callback when filters change
    onDataFetch?: (response: any) => any[]; // Transform API response to grid data
}

@Component({
    selector: 'app-common-grid',
    templateUrl: './common-grid.component.html',
    styleUrls: ['./common-grid.component.scss']
})
export class CommonGridComponent {
    @Input() columnDefs: ColDef[] = [];
    @Input() rowData: any[] = [];
    @Input() defaultColDef: ColDef = {};
    @Input() paginationPageSize: number = 10;
    @Input() apiConfig: GridApiConfig = { mode: 'client' }; // API configuration
    @Output() gridReady = new EventEmitter<GridReadyEvent>();
    @Output() filterChanged = new EventEmitter<any>();

    // Grid options with default settings
    public gridOptions: GridOptions = {
        pagination: true,
        paginationPageSize: this.paginationPageSize,
        suppressPaginationPanel: true, // Hide default pagination
        domLayout: 'normal'
    };

    onGridReady(params: GridReadyEvent) {
        console.log('Grid is ready');
        this.gridReady.emit(params);

        // If server mode, load initial data from API
        if (this.apiConfig.mode === 'server' && this.apiConfig.dataUrl) {
            this.loadServerData();
        }
    }

    onFirstDataRendered(params: any) {
        console.log('First data rendered');
        params.api.sizeColumnsToFit();
    }

    onFilterChanged(event: any) {
        // Emit filter change event to parent
        const filterModel = event.api.getFilterModel();
        this.filterChanged.emit(filterModel);

        // If using server-side filtering, notify parent
        if (this.apiConfig.mode === 'server' && this.apiConfig.onFilterChange) {
            const mappedFilters = this.mapFiltersToApi(filterModel);
            this.apiConfig.onFilterChange(mappedFilters);
        }
    }

    private mapFiltersToApi(filterModel: any): any {
        if (!this.apiConfig.columnMapping) {
            return filterModel;
        }

        const mappedFilters: any = {};
        Object.keys(filterModel).forEach(column => {
            const apiColumn = this.apiConfig.columnMapping![column] || column;
            mappedFilters[apiColumn] = filterModel[column];
        });

        return mappedFilters;
    }

    private loadServerData(): void {
        /* 
        // Example server-side data loading (commented out)
        // This demonstrates how to use the API configuration
        
        // Use the configured data URL
        const dataUrl = this.apiConfig.dataUrl || '/api/data';
        
        // Make API call to fetch initial data
        this.httpClient.get(dataUrl).subscribe((response: any) => {
            // Transform response using the configured transformer
            const data = this.apiConfig.onDataFetch 
                ? this.apiConfig.onDataFetch(response) 
                : response.data || response;
            
            // The API might return data with different field names
            // The columnMapping helps map API fields to grid fields
            // Example API response:
            // {
            //   data: [
            //     { chat_id: 'C-001', topic: 'Issue', lang: 'en', ... }
            //   ]
            // }
            
            // Update grid with transformed data
            this.rowData = data;
            if (this.gridApi) {
                this.gridApi.setRowData(data);
            }
        }, (error) => {
            console.error('Error loading server data:', error);
        });
        */
        console.log('Server data load would happen here:', this.apiConfig.dataUrl);
        console.log('Column mapping:', this.apiConfig.columnMapping);
    }

    public updateGridData(data: any[]): void {
        // Public method to update grid data from parent
        this.rowData = data;
    }
}
