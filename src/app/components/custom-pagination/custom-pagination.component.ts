import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridApi } from 'ag-grid-community';

export interface PaginationConfig {
    mode?: 'client' | 'server';
    totalRecords?: number;
    paginationUrl?: string;
    onPageChange?: (page: number, pageSize: number) => void;
}

@Component({
    selector: 'app-custom-pagination',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './custom-pagination.component.html',
    styleUrls: ['./custom-pagination.component.scss']
})
export class CustomPaginationComponent implements OnInit, OnDestroy {
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

    ngOnInit(): void {
        this.paginationMode = this.config.mode || 'client';
        this.totalRecords = this.config.totalRecords || 0;

        if (this.gridApi) {
            this.updatePaginationInfo();

            if (this.paginationMode === 'client') {
                this.gridApi.addEventListener('paginationChanged', () => {
                    this.updatePaginationInfo();
                });
            }
        }
    }

    ngOnDestroy(): void {
        // Clean up event listeners if needed
    }

    updatePaginationInfo(): void {
        if (this.paginationMode === 'client' && this.gridApi) {
            this.currentPage = this.gridApi.paginationGetCurrentPage() + 1;
            this.totalPages = this.gridApi.paginationGetTotalPages();
            this.pageSize = this.gridApi.paginationGetPageSize();
        } else if (this.paginationMode === 'server') {
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
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
            this.config.onPageChange(page, pageSize);
        }

        console.log('Server pagination would fetch:', { page, pageSize });
    }

    private getActiveFilters(): any {
        if (this.gridApi) {
            return this.gridApi.getFilterModel();
        }
        return {};
    }
}
