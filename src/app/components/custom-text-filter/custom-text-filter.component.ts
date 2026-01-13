import { Component } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export interface CustomTextFilterModel {
    filterText: string;
}

@Component({
    selector: 'app-custom-text-filter',
    templateUrl: './custom-text-filter.component.html',
    styleUrls: ['./custom-text-filter.component.scss']
})
export class CustomTextFilterComponent implements IFilterAngularComp {
    public params!: IFilterParams;
    public filterText: string = '';

    // Mandatory - called when filter is initialized
    agInit(params: IFilterParams): void {
        this.params = params;
    }

    // Required - check if filter is active
    isFilterActive(): boolean {
        return this.filterText !== '';
    }

    // Required - check if a row passes the filter
    doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (!this.filterText) {
            return true;
        }

        const { api, colDef, column, columnApi, context } = this.params;
        const value = this.params.valueGetter({
            api: api,
            colDef: colDef,
            column: column!,
            columnApi: columnApi,
            context: context,
            data: params.data,
            getValue: (field: string) => params.data[field],
            node: params.node
        });
        if (value == null) {
            return false;
        }

        // Simple case-insensitive text matching
        return value.toString().toLowerCase().indexOf(this.filterText.toLowerCase()) >= 0;
    }

    // Required - get the current filter model
    getModel(): CustomTextFilterModel | null {
        if (!this.isFilterActive()) {
            return null;
        }
        return { filterText: this.filterText };
    }

    // Required - set the filter model (called when loading saved filter)
    setModel(model: CustomTextFilterModel | null): void {
        this.filterText = model ? model.filterText : '';
    }

    // Called when filter text changes
    onFilterTextChanged(event: any): void {
        this.filterText = event.target.value;
        this.params.filterChangedCallback();
    }

    // Clear the filter
    clearFilter(): void {
        this.filterText = '';
        this.params.filterChangedCallback();
    }

    // Optional - called when filter popup is shown
    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        // Focus on the input field when filter opens
        setTimeout(() => {
            const input = document.querySelector('.custom-filter-input') as HTMLInputElement;
            if (input) {
                input.focus();
            }
        }, 0);
    }
}
