import { Component } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export interface CustomDateFilterParams extends IFilterParams {
    filterMode?: 'client' | 'server';
    onFilterChange?: (date: string) => void;
}

@Component({
    selector: 'app-custom-date-filter',
    templateUrl: './custom-date-filter.component.html',
    styleUrls: ['./custom-date-filter.component.scss']
})
export class CustomDateFilterComponent implements IFilterAngularComp {
    params!: CustomDateFilterParams;
    selectedDate: string = '';
    filterMode: 'client' | 'server' = 'client';

    agInit(params: CustomDateFilterParams): void {
        this.params = params;
        this.filterMode = params.filterMode || 'client';
    }

    isFilterActive(): boolean {
        return this.selectedDate !== '';
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (this.filterMode === 'server') {
            return true;
        }

        if (!this.isFilterActive()) {
            return true;
        }

        const { api, colDef, column, columnApi, context } = this.params;
        const cellValue = this.params.valueGetter({
            api,
            colDef,
            column: column!,
            columnApi,
            context,
            data: params.node.data,
            node: params.node,
            getValue: (field: string) => params.node.data?.[field]
        });

        if (!cellValue) {
            return false;
        }

        return cellValue.toString().includes(this.selectedDate);
    }

    getModel() {
        return this.isFilterActive() ? {
            date: this.selectedDate,
            mode: this.filterMode
        } : null;
    }

    setModel(model: any): void {
        this.selectedDate = model ? model.date : '';
    }

    onDateChange(event: any): void {
        this.selectedDate = event.target.value;

        if (this.filterMode === 'server') {
            if (this.params.onFilterChange) {
                this.params.onFilterChange(this.selectedDate);
            }

            /* 
            // Server-side filtering example (commented out)
            // Get the API field name from column mapping
            const apiFieldName = this.params.context?.apiConfig?.columnMapping?.[this.params.colDef.field!] 
              || this.params.colDef.field;
            
            // Build filter payload with mapped field name
            const filterPayload = {
              [apiFieldName]: this.selectedDate,
              filterType: 'date'
            };
            
            // Call parent's filter handler
            if (this.params.context?.apiConfig?.onFilterChange) {
              this.params.context.apiConfig.onFilterChange(filterPayload);
            }
            */
        } else {
            this.params.filterChangedCallback();
        }
    }

    clearFilter(): void {
        this.selectedDate = '';

        if (this.filterMode === 'server') {
            if (this.params.onFilterChange) {
                this.params.onFilterChange('');
            }
        } else {
            this.params.filterChangedCallback();
        }
    }
}
