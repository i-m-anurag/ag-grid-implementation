import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';
import { ILoadingOverlayParams } from 'ag-grid-community';

@Component({
    selector: 'app-error-overlay',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="error-overlay">
            <div class="error-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#EF4444" stroke-width="1.5"/>
                    <path d="M12 7V13" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="16.5" r="1" fill="#EF4444"/>
                </svg>
            </div>
            <h3 class="error-title">Something Went Wrong</h3>
            <p class="error-message">{{ errorMessage }}</p>
            <button class="retry-button" (click)="onRetryClick()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3.51 15C4.15 16.74 5.25 18.2 6.69 19.27C8.14 20.34 9.88 20.93 11.63 20.97C13.38 21 15.13 20.49 16.61 19.51C18.09 18.53 19.24 17.12 19.96 15.47C20.68 13.81 20.93 11.98 20.69 10.18C20.44 8.38 19.71 6.68 18.55 5.27C17.39 3.87 15.85 2.82 14.13 2.24C12.4 1.65 10.57 1.55 8.8 1.94" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Retry
            </button>
        </div>
    `,
    styles: [`
        .error-overlay {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 40px 20px;
            background: linear-gradient(180deg, #FEF2F2 0%, #FEE2E2 100%);
        }
        .error-icon {
            margin-bottom: 16px;
            animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .error-title {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #991B1B;
        }
        .error-message {
            margin: 0 0 20px 0;
            font-size: 14px;
            color: #DC2626;
            text-align: center;
            max-width: 300px;
        }
        .retry-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: #EF4444;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .retry-button:hover {
            background: #DC2626;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        .retry-button:active {
            transform: translateY(0);
        }
    `]
})
export class ErrorOverlayComponent implements ILoadingOverlayAngularComp {
    params!: ILoadingOverlayParams & { errorMessage?: string; onRetry?: () => void };
    errorMessage = 'Unable to load data. Please try again.';

    agInit(params: ILoadingOverlayParams & { errorMessage?: string; onRetry?: () => void }): void {
        this.params = params;
        if (params.errorMessage) {
            this.errorMessage = params.errorMessage;
        }
    }

    onRetryClick(): void {
        if (this.params.onRetry) {
            this.params.onRetry();
        }
    }
}
