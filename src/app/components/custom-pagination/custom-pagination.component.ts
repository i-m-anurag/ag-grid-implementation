import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridApi } from 'ag-grid-community';

export interface PaginationConfig {
    mode?: 'client' | 'server';
    totalRecords?: number;
    currentOffset?: number;
    onPageChange?: (offset: number, limit: number) => void;
}

@Component({
    selector: 'app-custom-pagination',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './custom-pagination.component.html',
    styleUrls: ['./custom-pagination.component.scss']
})
export class CustomPaginationComponent implements OnInit, OnDestroy, OnChanges {
    @Input() gridApi!: GridApi;
    @Input() config: PaginationConfig = { mode: 'client' };
    @Output() pageChange = new EventEmitter<number>();
    @Output() pageSizeChange = new EventEmitter<number>();

    currentPage: number = 1;
    totalPages: number = 1;
    pageSize: number = 10;
    pageSizeOptions: number[] = [10, 25, 50, 100];
    visiblePages: number[] = [];
    paginationMode: 'client' | 'server' = 'client';
    totalRecords: number = 0;
    currentOffset: number = 0;

    ngOnInit(): void {
        this.updateConfig();

        if (this.gridApi && this.paginationMode === 'client') {
            this.gridApi.addEventListener('paginationChanged', () => {
                this.updatePaginationInfo();
            });
            this.updatePaginationInfo();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['config'] && !changes['config'].firstChange) {
            this.updateConfig();
            this.updatePaginationInfo();
        }
    }

    ngOnDestroy(): void {
        // Clean up event listeners if needed
    }

    private updateConfig(): void {
        this.paginationMode = this.config.mode || 'client';
        // Only update totalRecords if provided, otherwise default to 0 for server mode
        // or let client mode handle it via gridApi
        if (this.config.totalRecords !== undefined) {
            this.totalRecords = this.config.totalRecords;
        }
    }

    updatePaginationInfo(): void {
        if (this.paginationMode === 'client' && this.gridApi) {
            this.currentPage = this.gridApi.paginationGetCurrentPage() + 1;
            this.totalPages = this.gridApi.paginationGetTotalPages();
            this.pageSize = this.gridApi.paginationGetPageSize();
        } else if (this.paginationMode === 'server') {
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            // Ensure totalPages is at least 1
            if (this.totalPages < 1) this.totalPages = 1;
        }

        this.visiblePages = this.getVisiblePages();
    }

    getVisiblePages(): number[] {
        const pages: number[] = [];
        const maxVisible = 5;

        if (this.totalPages <= maxVisible) {
            for (let i = 1; i <= this.totalPages; i++) {
                pages.push(i);
            }
        } else {
            const half = Math.floor(maxVisible / 2);
            let start = Math.max(1, this.currentPage - half);
            let end = Math.min(this.totalPages, start + maxVisible - 1);

            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
    }

    onPageSizeChange(event: any): void {
        const newSize = parseInt(event.target.value);
        this.pageSize = newSize;

        if (this.paginationMode === 'client' && this.gridApi) {
            this.gridApi.paginationSetPageSize(newSize);
        } else if (this.paginationMode === 'server') {
            this.currentPage = 1;
            this.updatePaginationInfo();
            this.fetchServerData(this.currentPage, newSize);
        }

        this.pageSizeChange.emit(newSize);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;

            if (this.paginationMode === 'client' && this.gridApi) {
                this.gridApi.paginationGoToPage(page - 1);
            } else if (this.paginationMode === 'server') {
                this.fetchServerData(page, this.pageSize);
            }

            this.pageChange.emit(page);
            this.updatePaginationInfo();
        }
    }

    goToPreviousPage(): void {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }

    goToNextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }

    isFirstPage(): boolean {
        return this.currentPage === 1;
    }

    isLastPage(): boolean {
        return this.currentPage === this.totalPages;
    }

    private fetchServerData(page: number, pageSize: number): void {
        if (this.config.onPageChange) {
            const offset = this.getOffsetFromPage(page, pageSize);
            this.config.onPageChange(offset, pageSize);
        }
    }

    private getOffsetFromPage(page: number, pageSize: number): number {
        return (page - 1) * pageSize;
    }

    private getActiveFilters(): any {
        if (this.gridApi) {
            return this.gridApi.getFilterModel();
        }
        return {};
    }
}
