import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'app-action-cell-renderer',
    templateUrl: './action-cell-renderer.component.html',
    styleUrls: ['./action-cell-renderer.component.scss']
})
export class ActionCellRendererComponent implements ICellRendererAngularComp {
    params: any;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }

    onViewClick(): void {
        if (this.params.onViewClick) {
            this.params.onViewClick(this.params.data);
        }
    }
}
