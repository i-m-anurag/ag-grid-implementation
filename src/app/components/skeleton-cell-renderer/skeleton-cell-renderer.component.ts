import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
    selector: 'app-skeleton-cell-renderer',
    standalone: true,
    imports: [CommonModule, NgxSkeletonLoaderModule],
    template: `
        <div class="skeleton-cell" *ngIf="isLoading">
            <ngx-skeleton-loader 
                [theme]="{ 
                    width: '90%',
                    height: '18px',
                    'border-radius': '6px',
                    'margin': '0',
                    'background-color': '#d0d0d0'
                }"
                [animation]="'progress'"
                [appearance]="'line'"
            ></ngx-skeleton-loader>
        </div>
        <span *ngIf="!isLoading">{{ value }}</span>
    `,
    styles: [`
        .skeleton-cell {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            padding: 4px 0;
        }
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }
        ::ng-deep .skeleton-cell .loader {
            background: linear-gradient(90deg, #d0d0d0 25%, #e8e8e8 50%, #d0d0d0 75%) !important;
            background-size: 200% 100% !important;
            animation: shimmer 1.5s infinite !important;
        }
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `]
})
export class SkeletonCellRendererComponent implements ICellRendererAngularComp {
    params!: ICellRendererParams;
    isLoading = false;
    value: any;

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.checkLoadingState(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.params = params;
        this.checkLoadingState(params);
        return true;
    }

    private checkLoadingState(params: ICellRendererParams): void {
        // Check if this is a skeleton/loading row
        this.isLoading = params.data?._isSkeletonRow === true;
        this.value = params.value;
    }
}
