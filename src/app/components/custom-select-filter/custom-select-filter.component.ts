import { Component } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export interface CustomSelectFilterParams extends IFilterParams {
    options: string[];
    variant?: 'default' | 'badge';
    badgeColors?: { [key: string]: { bg: string; text: string } };
    filterMode?: 'client' | 'server';
    selectionMode?: 'single' | 'multiple'; // Single or multiple selection
    onFilterChange?: (selectedOptions: string[]) => void;
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
    filterMode: 'client' | 'server' = 'client';
    selectionMode: 'single' | 'multiple' = 'multiple'; // Default to multiple

    agInit(params: CustomSelectFilterParams): void {
        this.params = params;
        this.options = params.options || [];
        this.variant = params.variant || 'default';
        this.badgeColors = params.badgeColors || {};
        this.filterMode = params.filterMode || 'client';
        this.selectionMode = params.selectionMode || 'multiple';

        // For single select mode, don't show "All" option
        if (this.selectionMode === 'single') {
            // No initial selection for single mode
        } else {
            // Multi-select mode - show "All" by default
            this.selectedOptions.add('All');
        }
    }

    get allOptions(): string[] {
        // Only include "All" for multi-select mode
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
        return this.isFilterActive() ? {
            options: Array.from(this.selectedOptions),
            mode: this.filterMode
        } : null;
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
            // Single select mode - only one option can be selected
            this.selectedOptions.clear();
            this.selectedOptions.add(option);
        } else {
            // Multi-select mode
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

        if (this.filterMode === 'server') {
            const selected = Array.from(this.selectedOptions);
            if (this.params.onFilterChange) {
                this.params.onFilterChange(selected);
            }

            /* 
            // Server-side filtering example (commented out)
            // Get the API field name from column mapping
            const apiFieldName = this.params.context?.apiConfig?.columnMapping?.[this.params.colDef.field!] 
              || this.params.colDef.field;
            
            // Build filter payload with mapped field name
            const filterPayload = {
              [apiFieldName]: selected.filter(opt => opt !== 'All'),
              filterType: 'select'
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
