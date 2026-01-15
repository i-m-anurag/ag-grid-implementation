import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export interface CustomSelectFilterParams extends IFilterParams {
    options: string[];
    variant?: 'default' | 'badge';
    badgeColors?: { [key: string]: { bg: string; text: string } };
    filterMode?: 'client' | 'server';
    selectionMode?: 'single' | 'multiple';
    filterType?: string;
    onFilterChange?: (selectedOptions: string[]) => void;
}

@Component({
    selector: 'app-custom-select-filter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './custom-select-filter.component.html',
    styleUrls: ['./custom-select-filter.component.scss']
})
export class CustomSelectFilterComponent implements IFilterAngularComp {
    params!: CustomSelectFilterParams;
    options: string[] = [];
    selectedOptions: Set<string> = new Set();
    variant: 'default' | 'badge' = 'default';
    badgeColors: { [key: string]: { bg: string; text: string } } = {};
    filterMode: 'client' | 'server' = 'client';
    selectionMode: 'single' | 'multiple' = 'multiple';
    filterType: string = 'select';

    agInit(params: CustomSelectFilterParams): void {
        this.params = params;
        this.options = params.options || [];
        this.variant = params.variant || 'default';
        this.badgeColors = params.badgeColors || {};
        this.filterMode = params.filterMode || 'client';
        this.selectionMode = params.selectionMode || 'multiple';
        this.filterType = params.filterType || 'select';

        if (this.selectionMode === 'single') {
            // No initial selection for single mode
        } else {
            this.selectedOptions.add('All');
        }
    }

    get allOptions(): string[] {
        if (this.selectionMode === 'multiple') {
            return ['All', ...this.options];
        }
        return this.options;
    }

    isFilterActive(): boolean {
        return this.selectedOptions.size > 0 && !this.selectedOptions.has('All');
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (this.filterMode === 'server') {
            return true;
        }

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
        return {
            filterType: this.filterType,
            options: this.isFilterActive() ? Array.from(this.selectedOptions) : []
        };
    }

    setModel(model: any): void {
        if (model) {
            this.selectedOptions = new Set(model.options || model);
        } else {
            this.selectedOptions.clear();
            this.selectedOptions.add('All');
        }
    }

    toggleOption(option: string): void {

        if (this.selectionMode === 'single') {
            // Allow unselection by clicking the same option again
            if (this.selectedOptions.has(option)) {
                this.selectedOptions.clear();
            } else {
                this.selectedOptions.clear();
                this.selectedOptions.add(option);
            }
        } else {
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
