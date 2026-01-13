import { Component } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export interface CustomTextFilterParams extends IFilterParams {
    placeholder?: string;
    filterMode?: 'client' | 'server';
    onFilterChange?: (filterValue: string) => void;
}

@Component({
    selector: 'app-custom-text-filter',
    templateUrl: './custom-text-filter.component.html',
    styleUrls: ['./custom-text-filter.component.scss']
})
export class CustomTextFilterComponent implements IFilterAngularComp {
    searchText: string = '';
    params!: CustomTextFilterParams;
    placeholder: string = 'Filter...';
    filterMode: 'client' | 'server' = 'client';

    agInit(params: CustomTextFilterParams): void {
        this.params = params;
        this.placeholder = params.placeholder || 'Filter...';
        this.filterMode = params.filterMode || 'client';
    }

    isFilterActive(): boolean {
        return this.searchText !== '';
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (this.filterMode === 'server') {
            return true;
        }

        if (!this.searchText) {
            return true;
        }

        const value = this.params.valueGetter({
            api: this.params.api,
            colDef: this.params.colDef,
            column: this.params.column!,
            columnApi: this.params.columnApi,
            context: this.params.context,
            data: params.node.data,
            node: params.node,
            getValue: (field: string) => params.node.data?.[field]
        });

        if (value == null) {
            return false;
        }

        return value.toString().toLowerCase().includes(this.searchText.toLowerCase());
    }

    getModel() {
        return this.isFilterActive() ? { text: this.searchText, mode: this.filterMode } : null;
    }

    setModel(model: any): void {
        this.searchText = model ? model.text : '';
    }

    onSearchChange(): void {
        // Debouncing is now handled by common-grid component
        // Just trigger the filter changed callback
        if (this.filterMode === 'server') {
            if (this.params.onFilterChange) {
                this.params.onFilterChange(this.searchText);
            }
        } else {
            this.params.filterChangedCallback();
        }
    }
}
