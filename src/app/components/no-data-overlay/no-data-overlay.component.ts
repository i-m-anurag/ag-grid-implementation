import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { INoRowsOverlayAngularComp } from 'ag-grid-angular';
import { INoRowsOverlayParams } from 'ag-grid-community';

@Component({
    selector: 'app-no-data-overlay',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="no-data-overlay">
            <div class="no-data-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6H4V18H20V6Z" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 10H20" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 6V4" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M16 6V4" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M9 14L15 14" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </div>
            <h3 class="no-data-title">No Data Found</h3>
            <p class="no-data-message">There are no records to display at this time.</p>
        </div>
    `,
    styles: [`
        .no-data-overlay {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 40px 20px;
            background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
        }
        .no-data-icon {
            margin-bottom: 16px;
            opacity: 0.7;
        }
        .no-data-title {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #374151;
        }
        .no-data-message {
            margin: 0;
            font-size: 14px;
            color: #6B7280;
            text-align: center;
        }
    `]
})
export class NoDataOverlayComponent implements INoRowsOverlayAngularComp {
    params!: INoRowsOverlayParams;

    agInit(params: INoRowsOverlayParams): void {
        this.params = params;
    }
}
