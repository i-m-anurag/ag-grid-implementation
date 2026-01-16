import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CustomTextFilterComponent } from '../custom-text-filter/custom-text-filter.component';
import { CustomSelectFilterComponent } from '../custom-select-filter/custom-select-filter.component';
import { CustomDateFilterComponent } from '../custom-date-filter/custom-date-filter.component';
import { ChatStatusBadgeComponent } from '../chat-status-badge/chat-status-badge.component';
import { ActionCellRendererComponent } from '../action-cell-renderer/action-cell-renderer.component';
import { NoDataOverlayComponent } from '../no-data-overlay/no-data-overlay.component';
import { ErrorOverlayComponent } from '../error-overlay/error-overlay.component';

export interface GridApiConfig {
    mode?: 'client' | 'server';
    columnMapping?: { [key: string]: string };
    debounceTime?: number;
    onFilterChange?: (filters: any) => void;
    onDataFetch?: (response: any) => any[];
    onLoadingChange?: (isLoading: boolean) => void;
}

@Component({
    selector: 'app-common-grid',
    standalone: true,
    imports: [
        CommonModule,
        AgGridModule,
        CustomTextFilterComponent,
        CustomSelectFilterComponent,
        CustomDateFilterComponent,
        ChatStatusBadgeComponent,
        ActionCellRendererComponent,
        NoDataOverlayComponent,
        ErrorOverlayComponent
    ],
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
    public isLoading: boolean = false;
    private columnFilterModes: Map<string, 'client' | 'server'> = new Map();
    private lastServerFiltersJson: string = '';
    public hasError: boolean = false;
    public errorMessage: string = '';
    private onRetryCallback?: () => void;

    public gridOptions: GridOptions = {
        pagination: true,
        paginationPageSize: this.paginationPageSize,
        suppressPaginationPanel: true,
        domLayout: 'normal',
        popupParent: document.body,
        suppressLoadingOverlay: true,
        noRowsOverlayComponent: NoDataOverlayComponent,
        // CSS-based skeleton: apply 'skeleton-row' class when row has _isSkeletonRow flag
        rowClassRules: {
            'skeleton-row': (params: any) => params.data?._isSkeletonRow === true
        }
    };

    constructor() {
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

        // Extract filter modes from column definitions
        this.columnDefs.forEach(colDef => {
            if (colDef.field && colDef.filterParams) {
                const filterMode = (colDef.filterParams as any)['filterMode'] || 'client';
                this.columnFilterModes.set(colDef.field, filterMode);
            }
        });

        this.gridReady.emit(params);
    }

    onFirstDataRendered(params: any) {
        console.log('First data rendered');
        params.api.sizeColumnsToFit();
    }

    onFilterChanged(event: any) {
        const filterModel = event.api.getFilterModel();
        this.filterChanged.emit(filterModel);
        this.filterSubject.next(filterModel);
    }

    private handleFilterChange(filterModel: any): void {
        if (this.apiConfig.mode === 'server' && this.apiConfig.onFilterChange) {
            // Separate server-mode and client-mode filters
            const serverFilters: any = {};
            // We don't need 'hasServerFilters' anymore since we want to trigger even if empty

            Object.keys(filterModel).forEach(column => {
                const filterMode = this.columnFilterModes.get(column) || 'client';
                if (filterMode === 'server') {
                    serverFilters[column] = filterModel[column];
                }
            });

            // Check if server filters actually changed
            const currentServerFiltersJson = JSON.stringify(serverFilters);

            if (this.lastServerFiltersJson !== currentServerFiltersJson) {
                this.lastServerFiltersJson = currentServerFiltersJson;

                const mappedFilters = this.mapFiltersToApi(serverFilters);
                this.apiConfig.onFilterChange(mappedFilters);
            }
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



    public updateGridData(data: any[], pageSize?: number): void {
        this.rowData = data;
        // Explicitly update the grid using the AG-Grid API
        if (this.gridApi) {
            // Update the page size first if provided (important for server-side pagination)
            if (pageSize !== undefined) {
                this.gridApi.paginationSetPageSize(pageSize);
            }
            // Then update the row data
            this.gridApi.setGridOption('rowData', data);
        }
    }

    public setLoading(loading: boolean): void {
        this.isLoading = loading;
        this.hasError = false; // Clear error state when loading
        if (this.gridApi) {
            if (loading) {
                // Create 10 skeleton rows with _isSkeletonRow flag and placeholder values
                const skeletonRows = Array(10).fill(null).map(() => {
                    const row: any = { _isSkeletonRow: true };
                    // Add placeholder values for each column so cells render
                    this.columnDefs.forEach((col: any) => {
                        if (col.field) {
                            row[col.field] = '';
                        }
                    });
                    return row;
                });
                this.gridApi.setGridOption('rowData', skeletonRows);
            }
            // Note: When loading is false, updateGridData will be called with actual data
        }
        if (this.apiConfig.onLoadingChange) {
            this.apiConfig.onLoadingChange(loading);
        }
    }

    public setError(message: string, onRetry?: () => void): void {
        this.hasError = true;
        this.isLoading = false;
        this.errorMessage = message;
        this.onRetryCallback = onRetry;
        if (this.gridApi) {
            // Clear row data first
            this.gridApi.setGridOption('rowData', []);
            // Enable loading overlay temporarily for error display
            this.gridApi.setGridOption('suppressLoadingOverlay', false);
            // Set the error overlay component and params
            this.gridApi.setGridOption('loadingOverlayComponent', ErrorOverlayComponent);
            this.gridApi.setGridOption('loadingOverlayComponentParams', {
                errorMessage: message,
                onRetry: () => {
                    this.clearError();
                    if (this.onRetryCallback) {
                        this.onRetryCallback();
                    }
                }
            });
            // Show the overlay
            this.gridApi.showLoadingOverlay();
        }
    }

    public clearError(): void {
        this.hasError = false;
        this.errorMessage = '';
        if (this.gridApi) {
            this.gridApi.hideOverlay();
            // Reset overlay settings
            this.gridApi.setGridOption('loadingOverlayComponent', undefined);
            this.gridApi.setGridOption('suppressLoadingOverlay', true);
        }
    }

    public clearAllFilters(): void {
        if (this.gridApi) {
            // Clear all filters
            this.gridApi.setFilterModel(null);

            // Reset to first page
            this.gridApi.paginationGoToFirstPage();

            // If server mode, notify parent to reload initial data
            if (this.apiConfig.mode === 'server' && this.apiConfig.onFilterChange) {
                this.apiConfig.onFilterChange({});
            }
        }
    }

    public hasActiveFilters(): boolean {
        if (!this.gridApi) return false;
        const filterModel = this.gridApi.getFilterModel();
        return Object.keys(filterModel).length > 0;
    }

    public getActiveFilters(): any {
        if (this.gridApi) {
            return this.gridApi.getFilterModel();
        }
        return {};
    }
}
