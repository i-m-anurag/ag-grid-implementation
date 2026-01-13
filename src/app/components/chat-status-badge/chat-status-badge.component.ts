import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'app-chat-status-badge',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './chat-status-badge.component.html',
    styleUrls: ['./chat-status-badge.component.scss']
})
export class ChatStatusBadgeComponent implements ICellRendererAngularComp {
    status: string = '';
    statusClass: string = '';

    agInit(params: ICellRendererParams): void {
        this.status = params.value;
        this.statusClass = this.getStatusClass(params.value);
    }

    refresh(params: ICellRendererParams): boolean {
        this.status = params.value;
        this.statusClass = this.getStatusClass(params.value);
        return true;
    }

    private getStatusClass(status: string): string {
        return status.toLowerCase().replace(/\s+/g, '-');
    }
}
