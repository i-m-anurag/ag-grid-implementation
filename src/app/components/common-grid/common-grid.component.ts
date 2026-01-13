import { Component, Input } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';

@Component({
    selector: 'app-common-grid',
    templateUrl: './common-grid.component.html',
    styleUrls: ['./common-grid.component.scss']
})
export class CommonGridComponent {
    @Input() columnDefs: ColDef[] = [];
    @Input() rowData: any[] = [];

    // Grid options with default settings
    public gridOptions: GridOptions = {
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 100
        },
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: [10, 20, 50, 100],
        domLayout: 'autoHeight'
    };

    onGridReady(params: any) {
        console.log('Grid is ready', params);
    }

    onFirstDataRendered(params: any) {
        console.log('First data rendered', params);
    }
}
