import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'app-chat-status-badge',
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
        // Map status to CSS classes
        const statusMap: { [key: string]: string } = {
            'resolved': 'status-resolved',
            'pending': 'status-pending',
            'in progress': 'status-in-progress',
            'closed': 'status-closed'
        };
        return statusMap[status?.toLowerCase()] || 'status-default';
    }
}
