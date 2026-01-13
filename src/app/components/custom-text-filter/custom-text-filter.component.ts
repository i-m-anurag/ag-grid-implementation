import { Component } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

@Component({
    selector: 'app-custom-text-filter',
    templateUrl: './custom-text-filter.component.html',
    styleUrls: ['./custom-text-filter.component.scss']
})
export class CustomTextFilterComponent implements IFilterAngularComp {
    searchText: string = '';
    params: any;
    placeholder: string = 'Filter...';

    agInit(params: any): void {
        this.params = params;
        this.placeholder = params.placeholder || 'Filter...';
    }

    isFilterActive(): boolean {
        return this.searchText !== '';
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (!this.searchText) {
            return true;
        }

        const value = this.params.valueGetter(params.node);
        if (value == null) {
            return false;
        }

        return value.toString().toLowerCase().includes(this.searchText.toLowerCase());
    }

    getModel() {
        return this.isFilterActive() ? { text: this.searchText } : null;
    }

    setModel(model: any): void {
        this.searchText = model ? model.text : '';
    }

    onSearchChange(): void {
        this.params.filterChangedCallback();
    }
}
