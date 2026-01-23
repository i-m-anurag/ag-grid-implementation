import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export interface CustomDateFilterParams extends IFilterParams {
    filterMode?: 'client' | 'server';
    filterType?: 'date' | 'date-range';
    fromDate?: string | Date;  // Minimum selectable date
    toDate?: string | Date;    // Maximum selectable date
    onFilterChange?: (date: string, timeFrom?: string, timeTo?: string) => void;
}

interface CalendarDay {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
}

@Component({
    selector: 'app-custom-date-filter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './custom-date-filter.component.html',
    styleUrls: ['./custom-date-filter.component.scss']
})
export class CustomDateFilterComponent implements IFilterAngularComp {
    params!: CustomDateFilterParams;

    // ============ SINGLE DATE MODE STATE ============
    // Applied State (The Source of Truth)
    selectedDate: Date | null = null;
    timeFrom: string = '';
    timeTo: string = '';

    // UI State (Pending Changes)
    tempSelectedDate: Date | null = null;
    tempTimeFrom: string = '';
    tempTimeTo: string = '';

    // ============ DATE RANGE MODE STATE ============
    // Applied State
    selectedStartDate: Date | null = null;
    selectedEndDate: Date | null = null;

    // UI State (Pending Changes)
    tempSelectedStartDate: Date | null = null;
    tempSelectedEndDate: Date | null = null;
    rangeSelectionStep: 'start' | 'end' = 'start';

    // ============ COMMON STATE ============
    currentMonth: Date = new Date();
    filterMode: 'client' | 'server' = 'client';
    filterType: 'date' | 'date-range' = 'date';

    // Date range constraints
    fromDate: Date | null = null;
    toDate: Date | null = null;

    availableMonths = [
        { value: 0, label: 'January' },
        { value: 1, label: 'February' },
        { value: 2, label: 'March' },
        { value: 3, label: 'April' },
        { value: 4, label: 'May' },
        { value: 5, label: 'June' },
        { value: 6, label: 'July' },
        { value: 7, label: 'August' },
        { value: 8, label: 'September' },
        { value: 9, label: 'October' },
        { value: 10, label: 'November' },
        { value: 11, label: 'December' }
    ];

    availableYears: number[] = [];

    weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    calendarDays: CalendarDay[] = [];

    // Time options for dropdowns (24-hour format)
    timeOptions: string[] = [
        '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];

    agInit(params: CustomDateFilterParams): void {
        this.params = params;
        this.filterMode = params.filterMode || 'client';
        this.filterType = params.filterType || 'date';

        // Parse date range constraints
        this.fromDate = this.parseDate(params.fromDate);
        this.toDate = this.parseDate(params.toDate);

        this.generateYears();

        // Initialize calendar to show fromDate if configured, otherwise current date
        if (this.fromDate) {
            this.currentMonth = new Date(this.fromDate);
        }

        this.generateCalendar();
    }

    // Called when column definition params change dynamically
    refresh(params: CustomDateFilterParams): boolean {
        this.params = params;

        // Re-parse date range constraints with new values
        this.fromDate = this.parseDate(params.fromDate);
        this.toDate = this.parseDate(params.toDate);

        // Check if current filter is still valid within new range
        let filterInvalidated = false;

        if (this.filterType === 'date-range') {
            // Date range mode: check if start or end date is out of range
            if (this.selectedStartDate && this.isDateOutOfRange(this.selectedStartDate)) {
                filterInvalidated = true;
            }
            if (this.selectedEndDate && this.isDateOutOfRange(this.selectedEndDate)) {
                filterInvalidated = true;
            }
        } else {
            // Single date mode: check if selected date is out of range
            if (this.selectedDate && this.isDateOutOfRange(this.selectedDate)) {
                filterInvalidated = true;
            }
        }

        // If filter is now invalid, clear it
        if (filterInvalidated) {
            this.clearFilterState();
            // Notify grid that filter has changed
            this.params.filterChangedCallback();
        }

        // Update calendar view to show new fromDate
        if (this.fromDate) {
            this.currentMonth = new Date(this.fromDate);
        }

        // Regenerate calendar to reflect new constraints
        this.generateCalendar();

        return true; // Return true to indicate the filter was successfully refreshed
    }

    // Helper to check if a date is outside the allowed range
    private isDateOutOfRange(date: Date): boolean {
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (this.fromDate) {
            const fromStart = new Date(this.fromDate.getFullYear(), this.fromDate.getMonth(), this.fromDate.getDate());
            if (dateOnly < fromStart) return true;
        }

        if (this.toDate) {
            const toEnd = new Date(this.toDate.getFullYear(), this.toDate.getMonth(), this.toDate.getDate());
            if (dateOnly > toEnd) return true;
        }

        return false;
    }

    // Clear all filter state
    private clearFilterState(): void {
        this.selectedDate = null;
        this.selectedStartDate = null;
        this.selectedEndDate = null;
        this.timeFrom = '';
        this.timeTo = '';

        this.tempSelectedDate = null;
        this.tempSelectedStartDate = null;
        this.tempSelectedEndDate = null;
        this.tempTimeFrom = '';
        this.tempTimeTo = '';
        this.rangeSelectionStep = 'start';
    }

    private parseDate(date: string | Date | undefined): Date | null {
        if (!date) return null;
        const parsed = date instanceof Date ? date : new Date(date);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    isDateDisabled(day: CalendarDay): boolean {
        const date = new Date(day.year, day.month, day.day);

        if (this.fromDate) {
            const fromStart = new Date(this.fromDate.getFullYear(), this.fromDate.getMonth(), this.fromDate.getDate());
            if (date < fromStart) return true;
        }

        if (this.toDate) {
            const toEnd = new Date(this.toDate.getFullYear(), this.toDate.getMonth(), this.toDate.getDate());
            if (date > toEnd) return true;
        }

        return false;
    }

    // Called every time the popup opens
    afterGuiAttached(params?: any): void {
        if (this.filterType === 'date-range') {
            // Sync UI state with Applied state for range mode
            this.tempSelectedStartDate = this.selectedStartDate ? new Date(this.selectedStartDate) : null;
            this.tempSelectedEndDate = this.selectedEndDate ? new Date(this.selectedEndDate) : null;
            this.tempTimeFrom = this.timeFrom;
            this.tempTimeTo = this.timeTo;

            // Reset selection step
            this.rangeSelectionStep = this.tempSelectedStartDate && !this.tempSelectedEndDate ? 'end' : 'start';

            // Navigate to configured fromDate or selected start date
            if (this.tempSelectedStartDate) {
                this.currentMonth = new Date(this.tempSelectedStartDate);
            } else if (this.fromDate) {
                this.currentMonth = new Date(this.fromDate);
            } else {
                this.currentMonth = new Date();
            }
        } else {
            // Single date mode
            this.tempSelectedDate = this.selectedDate ? new Date(this.selectedDate) : null;
            this.tempTimeFrom = this.timeFrom;
            this.tempTimeTo = this.timeTo;

            // Navigate to configured fromDate or selected date
            if (this.tempSelectedDate) {
                this.currentMonth = new Date(this.tempSelectedDate);
            } else if (this.fromDate) {
                this.currentMonth = new Date(this.fromDate);
            } else {
                this.currentMonth = new Date();
            }
        }

        this.generateCalendar();
    }

    generateYears(): void {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 10;
        const endYear = currentYear + 10;
        this.availableYears = [];
        for (let year = startYear; year <= endYear; year++) {
            this.availableYears.push(year);
        }
    }

    onMonthChange(event: any): void {
        const newMonth = parseInt(event.target.value);
        this.currentMonth = new Date(this.currentMonth.getFullYear(), newMonth, 1);
        this.generateCalendar();
    }

    onYearChange(event: any): void {
        const newYear = parseInt(event.target.value);
        this.currentMonth = new Date(newYear, this.currentMonth.getMonth(), 1);
        this.generateCalendar();
    }

    isPopup(): boolean {
        return true;
    }

    isFilterActive(): boolean {
        if (this.filterType === 'date-range') {
            return this.selectedStartDate !== null && this.selectedEndDate !== null;
        }
        return this.selectedDate !== null;
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (this.filterMode === 'server') {
            return true;
        }

        if (!this.isFilterActive()) {
            return true;
        }

        const { api, colDef, column, columnApi, context } = this.params;
        const cellValue = this.params.valueGetter({
            api,
            colDef,
            column: column!,
            columnApi,
            context,
            data: params.node.data,
            node: params.node,
            getValue: (field: string) => params.node.data?.[field]
        });

        if (!cellValue) {
            return false;
        }

        // Parse ISO date (e.g., "2026-01-15T07:03:12.175Z")
        const cellDate = new Date(cellValue);

        if (isNaN(cellDate.getTime())) {
            return false;
        }

        if (this.filterType === 'date-range') {
            // Date range mode: check if cell date falls within the selected range
            const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
            const startDateOnly = new Date(this.selectedStartDate!.getFullYear(), this.selectedStartDate!.getMonth(), this.selectedStartDate!.getDate());
            const endDateOnly = new Date(this.selectedEndDate!.getFullYear(), this.selectedEndDate!.getMonth(), this.selectedEndDate!.getDate());

            if (cellDateOnly < startDateOnly || cellDateOnly > endDateOnly) {
                return false;
            }

            // If time range is specified, check time
            if (this.timeFrom || this.timeTo) {
                const cellTime = this.formatTime(cellDate);
                const cellMinutes = this.timeToMinutes(cellTime);

                if (this.timeFrom) {
                    const fromMinutes = this.timeToMinutes(this.timeFrom);
                    if (cellMinutes < fromMinutes) {
                        return false;
                    }
                }

                if (this.timeTo) {
                    const toMinutes = this.timeToMinutes(this.timeTo);
                    if (cellMinutes > toMinutes) {
                        return false;
                    }
                }
            }
        } else {
            // Single date mode
            const selectedDateStr = this.formatDate(this.selectedDate!);
            const cellDateStr = this.formatDate(cellDate);

            if (cellDateStr !== selectedDateStr) {
                return false;
            }

            // If time range is specified, check time
            if (this.timeFrom || this.timeTo) {
                const cellTime = this.formatTime(cellDate);
                const cellMinutes = this.timeToMinutes(cellTime);

                if (this.timeFrom) {
                    const fromMinutes = this.timeToMinutes(this.timeFrom);
                    if (cellMinutes < fromMinutes) {
                        return false;
                    }
                }

                if (this.timeTo) {
                    const toMinutes = this.timeToMinutes(this.timeTo);
                    if (cellMinutes > toMinutes) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    getModel() {
        if (!this.isFilterActive()) {
            return null;
        }

        if (this.filterType === 'date-range') {
            return {
                filterType: 'date-range',
                startDate: this.formatDate(this.selectedStartDate!),
                endDate: this.formatDate(this.selectedEndDate!),
                timeFrom: this.timeFrom,
                timeTo: this.timeTo
            };
        }

        return {
            filterType: 'date',
            date: this.formatDate(this.selectedDate!),
            timeFrom: this.timeFrom,
            timeTo: this.timeTo
        };
    }

    setModel(model: any): void {
        if (model) {
            if (model.filterType === 'date-range' || (model.startDate && model.endDate)) {
                // Date range model
                this.selectedStartDate = model.startDate ? new Date(model.startDate) : null;
                this.selectedEndDate = model.endDate ? new Date(model.endDate) : null;
                this.timeFrom = model.timeFrom || '';
                this.timeTo = model.timeTo || '';

                // Sync temp state
                this.tempSelectedStartDate = this.selectedStartDate ? new Date(this.selectedStartDate) : null;
                this.tempSelectedEndDate = this.selectedEndDate ? new Date(this.selectedEndDate) : null;
                this.tempTimeFrom = this.timeFrom;
                this.tempTimeTo = this.timeTo;

                if (this.selectedStartDate) {
                    this.currentMonth = new Date(this.selectedStartDate);
                    this.generateCalendar();
                }
            } else if (model.date) {
                // Single date model
                this.selectedDate = new Date(model.date);
                this.timeFrom = model.timeFrom || '';
                this.timeTo = model.timeTo || '';

                // Sync temp state
                this.tempSelectedDate = new Date(this.selectedDate);
                this.tempTimeFrom = this.timeFrom;
                this.tempTimeTo = this.timeTo;
                this.currentMonth = new Date(this.selectedDate);
                this.generateCalendar();
            }
        } else {
            // Clear all state
            this.selectedDate = null;
            this.selectedStartDate = null;
            this.selectedEndDate = null;
            this.timeFrom = '';
            this.timeTo = '';

            this.tempSelectedDate = null;
            this.tempSelectedStartDate = null;
            this.tempSelectedEndDate = null;
            this.tempTimeFrom = '';
            this.tempTimeTo = '';
            this.rangeSelectionStep = 'start';
        }
    }

    generateCalendar(): void {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Get day of week (0 = Sunday, adjust to Monday = 0)
        let startDayOfWeek = firstDay.getDay() - 1;
        if (startDayOfWeek === -1) startDayOfWeek = 6;

        const days: CalendarDay[] = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                month: month - 1,
                year: month === 0 ? year - 1 : year,
                isCurrentMonth: false
            });
        }

        // Current month days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push({
                day,
                month,
                year,
                isCurrentMonth: true
            });
        }

        // Next month days to fill grid
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            days.push({
                day,
                month: month + 1,
                year: month === 11 ? year + 1 : year,
                isCurrentMonth: false
            });
        }

        this.calendarDays = days;
    }

    getMonthYearDisplay(): string {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
    }

    previousMonth(): void {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
        this.generateCalendar();
    }

    nextMonth(): void {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
        this.generateCalendar();
    }

    selectDay(day: CalendarDay): void {
        // Prevent selection of disabled dates
        if (this.isDateDisabled(day)) return;

        const selectedDate = new Date(day.year, day.month, day.day);

        if (this.filterType === 'date-range') {
            // Date range mode: two-step selection
            if (this.rangeSelectionStep === 'start') {
                // First click: set start date, clear end date
                this.tempSelectedStartDate = selectedDate;
                this.tempSelectedEndDate = null;
                this.rangeSelectionStep = 'end';
            } else {
                // Second click: set end date
                if (selectedDate < this.tempSelectedStartDate!) {
                    // If end date is before start date, swap them
                    this.tempSelectedEndDate = this.tempSelectedStartDate;
                    this.tempSelectedStartDate = selectedDate;
                } else {
                    this.tempSelectedEndDate = selectedDate;
                }
                this.rangeSelectionStep = 'start';
            }
        } else {
            // Single date mode
            this.tempSelectedDate = selectedDate;
        }

        if (day.month !== this.currentMonth.getMonth()) {
            this.currentMonth = new Date(day.year, day.month, 1);
            this.generateCalendar();
        }
    }

    isSelectedDay(day: CalendarDay): boolean {
        if (this.filterType === 'date-range') {
            // Check if it's the start or end date in range mode
            return this.isRangeStart(day) || this.isRangeEnd(day);
        }

        // Single date mode
        if (!this.tempSelectedDate) return false;
        return day.day === this.tempSelectedDate.getDate() &&
            day.month === this.tempSelectedDate.getMonth() &&
            day.year === this.tempSelectedDate.getFullYear();
    }

    isRangeStart(day: CalendarDay): boolean {
        if (!this.tempSelectedStartDate) return false;
        return day.day === this.tempSelectedStartDate.getDate() &&
            day.month === this.tempSelectedStartDate.getMonth() &&
            day.year === this.tempSelectedStartDate.getFullYear();
    }

    isRangeEnd(day: CalendarDay): boolean {
        if (!this.tempSelectedEndDate) return false;
        return day.day === this.tempSelectedEndDate.getDate() &&
            day.month === this.tempSelectedEndDate.getMonth() &&
            day.year === this.tempSelectedEndDate.getFullYear();
    }

    isInRange(day: CalendarDay): boolean {
        if (this.filterType !== 'date-range') return false;
        if (!this.tempSelectedStartDate || !this.tempSelectedEndDate) return false;

        const date = new Date(day.year, day.month, day.day);
        const startDate = new Date(this.tempSelectedStartDate.getFullYear(), this.tempSelectedStartDate.getMonth(), this.tempSelectedStartDate.getDate());
        const endDate = new Date(this.tempSelectedEndDate.getFullYear(), this.tempSelectedEndDate.getMonth(), this.tempSelectedEndDate.getDate());

        return date > startDate && date < endDate;
    }

    isToday(day: CalendarDay): boolean {
        const today = new Date();
        return day.day === today.getDate() &&
            day.month === today.getMonth() &&
            day.year === today.getFullYear();
    }

    // Helper to display selected date(s) in the header
    getSelectedRangeDisplay(): string {
        if (this.filterType === 'date-range') {
            const startStr = this.tempSelectedStartDate ? this.formatDisplayDate(this.tempSelectedStartDate) : '---';
            const endStr = this.tempSelectedEndDate ? this.formatDisplayDate(this.tempSelectedEndDate) : '---';
            return `${startStr} → ${endStr}`;
        }
        return this.tempSelectedDate ? this.formatDisplayDate(this.tempSelectedDate) : '---';
    }

    formatDisplayDate(date: Date): string {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    onApply(): void {
        if (this.filterType === 'date-range') {
            // Commit changes: Temp -> Applied for range mode
            this.selectedStartDate = this.tempSelectedStartDate;
            this.selectedEndDate = this.tempSelectedEndDate;
            this.timeFrom = this.tempTimeFrom;
            this.timeTo = this.tempTimeTo;

            if (this.selectedStartDate && this.selectedEndDate) {
                this.params.filterChangedCallback();
            }
        } else {
            // Single date mode
            this.selectedDate = this.tempSelectedDate;
            this.timeFrom = this.tempTimeFrom;
            this.timeTo = this.tempTimeTo;

            if (this.selectedDate) {
                this.params.filterChangedCallback();
            }
        }
        // Close popup
        this.params.api.hidePopupMenu();
    }

    onCancel(): void {
        // Clear all filter state
        this.selectedDate = null;
        this.selectedStartDate = null;
        this.selectedEndDate = null;
        this.timeFrom = '';
        this.timeTo = '';

        // Reset temp state
        this.tempSelectedDate = null;
        this.tempSelectedStartDate = null;
        this.tempSelectedEndDate = null;
        this.tempTimeFrom = '';
        this.tempTimeTo = '';
        this.rangeSelectionStep = 'start';

        // Reset calendar to fromDate if configured, otherwise today
        this.currentMonth = this.fromDate ? new Date(this.fromDate) : new Date();
        this.generateCalendar();

        this.params.filterChangedCallback();
        this.params.api.hidePopupMenu();
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
}
