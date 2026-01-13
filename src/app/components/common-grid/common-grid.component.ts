import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';

@Component({
    selector: 'app-common-grid',
    templateUrl: './common-grid.component.html',
    styleUrls: ['./common-grid.component.scss']
})
export class CommonGridComponent {
    @Input() columnDefs: ColDef[] = [];
    @Input() rowData: any[] = [];
    @Input() defaultColDef: ColDef = {};
    @Input() paginationPageSize: number = 10;
    @Output() gridReady = new EventEmitter<GridReadyEvent>();

    // Grid options with default settings
    public gridOptions: GridOptions = {
        pagination: true,
        paginationPageSize: this.paginationPageSize,
        suppressPaginationPanel: true, // Hide default pagination
        domLayout: 'normal'
    };

    onGridReady(params: GridReadyEvent) {
        console.log('Grid is ready');
        this.gridReady.emit(params);
    }

    onFirstDataRendered(params: any) {
        console.log('First data rendered');
        params.api.sizeColumnsToFit();
    }
}
