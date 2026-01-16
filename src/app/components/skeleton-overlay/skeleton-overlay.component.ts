import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';
import { ILoadingOverlayParams } from 'ag-grid-community';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
    selector: 'app-skeleton-overlay',
    standalone: true,
    imports: [CommonModule, NgxSkeletonLoaderModule],
    template: `
        <div class="skeleton-overlay">
            <div class="skeleton-row" *ngFor="let row of rows">
                <ngx-skeleton-loader 
                    *ngFor="let col of columns"
                    [theme]="{ 
                        width: '90%',
                        height: '14px',
                        'border-radius': '4px',
                        'margin': '0 8px'
                    }"
                    [animation]="'pulse'"
                ></ngx-skeleton-loader>
            </div>
        </div>
    `,
    styles: [`
        .skeleton-overlay {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 0;
            background: white;
        }
        .skeleton-row {
            display: flex;
            border-bottom: 1px solid #e8e8e8;
            height: 42px;
            align-items: center;
            padding: 0 4px;
        }
        .skeleton-row ngx-skeleton-loader {
            flex: 1;
        }
    `]
})
export class SkeletonOverlayComponent implements ILoadingOverlayAngularComp {
    params!: ILoadingOverlayParams;
    rows = Array(10).fill(0);
    columns = Array(6).fill(0);

    agInit(params: ILoadingOverlayParams): void {
        this.params = params;
    }
}
