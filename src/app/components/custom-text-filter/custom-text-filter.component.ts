import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export interface CustomTextFilterParams extends IFilterParams {
    placeholder?: string;
    filterMode?: 'client' | 'server';
    filterType?: string;
    onFilterChange?: (filterValue: string) => void;
}

@Component({
    selector: 'app-custom-text-filter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './custom-text-filter.component.html',
    styleUrls: ['./custom-text-filter.component.scss']
})
export class CustomTextFilterComponent implements IFilterAngularComp {
    searchText: string = '';
    params!: CustomTextFilterParams;
    placeholder: string = 'Filter...';
    filterMode: 'client' | 'server' = 'client';
    filterType: string = 'text';

    agInit(params: CustomTextFilterParams): void {
        this.params = params;
        this.placeholder = params.placeholder || 'Filter...';
        this.filterMode = params.filterMode || 'client';
        this.filterType = params.filterType || 'text';
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
        return this.isFilterActive() ? {
            filterType: this.filterType,
            filter: this.searchText
        } : null;
    }

    setModel(model: any): void {
        this.searchText = model ? (model.filter || model.text || '') : '';
    }

    onSearchChange(): void {
        this.params.filterChangedCallback();
    }
}
