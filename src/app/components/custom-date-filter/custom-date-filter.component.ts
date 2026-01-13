import { Component } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

@Component({
    selector: 'app-custom-date-filter',
    templateUrl: './custom-date-filter.component.html',
    styleUrls: ['./custom-date-filter.component.scss']
})
export class CustomDateFilterComponent implements IFilterAngularComp {
    params!: IFilterParams;
    selectedDate: string = '';

    agInit(params: IFilterParams): void {
        this.params = params;
    }

    isFilterActive(): boolean {
        return this.selectedDate !== '';
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
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

        // Simple date comparison
        return cellValue.toString().includes(this.selectedDate);
    }

    getModel() {
        return this.isFilterActive() ? { date: this.selectedDate } : null;
    }

    setModel(model: any): void {
        this.selectedDate = model ? model.date : '';
    }

    onDateChange(event: any): void {
        this.selectedDate = event.target.value;
        this.params.filterChangedCallback();
    }

    clearFilter(): void {
        this.selectedDate = '';
        this.params.filterChangedCallback();
    }
}
