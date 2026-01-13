import { Component } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export interface CustomSelectFilterParams extends IFilterParams {
    options: string[];
    variant?: 'default' | 'badge';
    badgeColors?: { [key: string]: { bg: string; text: string } };
}

@Component({
    selector: 'app-custom-select-filter',
    templateUrl: './custom-select-filter.component.html',
    styleUrls: ['./custom-select-filter.component.scss']
})
export class CustomSelectFilterComponent implements IFilterAngularComp {
    params!: CustomSelectFilterParams;
    options: string[] = [];
    selectedOptions: Set<string> = new Set();
    variant: 'default' | 'badge' = 'default';
    badgeColors: { [key: string]: { bg: string; text: string } } = {};

    agInit(params: CustomSelectFilterParams): void {
        this.params = params;
        this.options = params.options || [];
        this.variant = params.variant || 'default';
        this.badgeColors = params.badgeColors || {};

        // Initially select "All"
        this.selectedOptions.add('All');
    }

    get allOptions(): string[] {
        return ['All', ...this.options];
    }

    isFilterActive(): boolean {
        return this.selectedOptions.size > 0 && !this.selectedOptions.has('All');
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (this.selectedOptions.has('All') || this.selectedOptions.size === 0) {
            return true;
        }

        const { api, colDef, column, columnApi, context } = this.params;
        const value = this.params.valueGetter({
            api,
            colDef,
            column: column!,
            columnApi,
            context,
            data: params.node.data,
            node: params.node,
            getValue: (field: string) => params.node.data?.[field]
        });

        return this.selectedOptions.has(value);
    }

    getModel() {
        return this.isFilterActive() ? Array.from(this.selectedOptions) : null;
    }

    setModel(model: any): void {
        if (model) {
            this.selectedOptions = new Set(model);
        } else {
            this.selectedOptions.clear();
            this.selectedOptions.add('All');
        }
    }

    toggleOption(option: string): void {
        if (option === 'All') {
            this.selectedOptions.clear();
            this.selectedOptions.add('All');
        } else {
            this.selectedOptions.delete('All');
            if (this.selectedOptions.has(option)) {
                this.selectedOptions.delete(option);
                if (this.selectedOptions.size === 0) {
                    this.selectedOptions.add('All');
                }
            } else {
                this.selectedOptions.add(option);
            }
        }
        this.params.filterChangedCallback();
    }

    isSelected(option: string): boolean {
        return this.selectedOptions.has(option);
    }

    getBadgeStyle(option: string) {
        const colors = this.badgeColors[option.toLowerCase()];
        if (colors) {
            return {
                'background-color': colors.bg,
                'color': colors.text
            };
        }
        return {};
    }
}
