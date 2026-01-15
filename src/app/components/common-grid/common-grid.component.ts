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
        ActionCellRendererComponent
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

    public gridOptions: GridOptions = {
        pagination: true,
        paginationPageSize: this.paginationPageSize,
        suppressPaginationPanel: true,
        domLayout: 'normal',
        popupParent: document.body
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
            let hasServerFilters = false;

            Object.keys(filterModel).forEach(column => {
                const filterMode = this.columnFilterModes.get(column) || 'client';
                if (filterMode === 'server') {
                    serverFilters[column] = filterModel[column];
                    hasServerFilters = true;
                }
            });

            // Only trigger API callback if there are server-mode filters
            if (hasServerFilters) {
                this.setLoading(true);
                const mappedFilters = this.mapFiltersToApi(serverFilters);
                this.apiConfig.onFilterChange(mappedFilters);

                // Note: Parent should call setLoading(false) after API completes
                // Or use setTimeout to auto-hide after reasonable time
                setTimeout(() => {
                    if (this.isLoading) {
                        this.setLoading(false);
                    }
                }, 5000); // Auto-hide after 5 seconds as fallback
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



    public updateGridData(data: any[]): void {
        this.rowData = data;
    }

    public setLoading(loading: boolean): void {
        this.isLoading = loading;
        if (this.apiConfig.onLoadingChange) {
            this.apiConfig.onLoadingChange(loading);
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
}
