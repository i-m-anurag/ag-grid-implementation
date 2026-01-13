import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface GridApiConfig {
    mode?: 'client' | 'server';
    filterUrl?: string;
    paginationUrl?: string;
    dataUrl?: string;
    columnMapping?: { [key: string]: string };
    debounceTime?: number; // Debounce time for API calls in milliseconds (default: 300ms)
    onFilterChange?: (filters: any) => void;
    onDataFetch?: (response: any) => any[];
}

@Component({
    selector: 'app-common-grid',
    templateUrl: './common-grid.component.html',
    styleUrls: ['./common-grid.component.scss']
})
export class CommonGridComponent implements OnDestroy {
    @Input() columnDefs: ColDef[] = [];
    @Input() rowData: any[] = [];
    @Input() defaultColDef: ColDef = {};
    @Input() paginationPageSize: number = 10;
    @Input() apiConfig: GridApiConfig = { mode: 'client' };
    @Output() gridReady = new EventEmitter<GridReadyEvent>();
    @Output() filterChanged = new EventEmitter<any>();

    private filterSubject = new Subject<any>();
    private gridApi: any;

    // Grid options with default settings
    public gridOptions: GridOptions = {
        pagination: true,
        paginationPageSize: this.paginationPageSize,
        suppressPaginationPanel: true,
        domLayout: 'normal'
    };

    constructor() {
        // Setup debounced filter handling
        const debounceMs = this.apiConfig.debounceTime || 300;
        this.filterSubject.pipe(
            debounceTime(debounceMs)
        ).subscribe((filterModel: any) => {
            this.handleFilterChange(filterModel);
        });
    }

    ngOnDestroy(): void {
        this.filterSubject.complete();
    }

    onGridReady(params: GridReadyEvent) {
        console.log('Grid is ready');
        this.gridApi = params.api;
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
        const filterModel = event.api.getFilterModel();
        this.filterChanged.emit(filterModel);

        // Push to subject for debouncing
        this.filterSubject.next(filterModel);
    }

    private handleFilterChange(filterModel: any): void {
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
