import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { GridApi } from 'ag-grid-community';

@Component({
    selector: 'app-custom-pagination',
    templateUrl: './custom-pagination.component.html',
    styleUrls: ['./custom-pagination.component.scss']
})
export class CustomPaginationComponent implements OnInit {
    @Input() gridApi!: GridApi;
    @Output() pageChange = new EventEmitter<number>();
    @Output() pageSizeChange = new EventEmitter<number>();

    currentPage: number = 1;
    totalPages: number = 1;
    pageSize: number = 10;
    pageSizeOptions: number[] = [10, 25, 50, 100];
    visiblePages: number[] = [];

    ngOnInit(): void {
        if (this.gridApi) {
            this.updatePaginationInfo();

            // Listen to AG-Grid pagination events
            this.gridApi.addEventListener('paginationChanged', () => {
                this.updatePaginationInfo();
            });
        }
    }

    updatePaginationInfo(): void {
        if (this.gridApi) {
            this.currentPage = this.gridApi.paginationGetCurrentPage() + 1; // AG-Grid uses 0-based index
            this.totalPages = this.gridApi.paginationGetTotalPages();
            this.pageSize = this.gridApi.paginationGetPageSize();
            this.visiblePages = this.getVisiblePages();
        }
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
        if (this.gridApi) {
            this.gridApi.paginationSetPageSize(newSize);
        }
        this.pageSizeChange.emit(newSize);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            if (this.gridApi) {
                this.gridApi.paginationGoToPage(page - 1); // AG-Grid uses 0-based index
            }
            this.pageChange.emit(page);
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
}
