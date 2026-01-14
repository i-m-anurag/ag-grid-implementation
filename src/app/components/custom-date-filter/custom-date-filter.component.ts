import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export interface CustomDateFilterParams extends IFilterParams {
    filterMode?: 'client' | 'server';
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

    // Applied State (The Source of Truth)
    selectedDate: Date | null = null;
    timeFrom: string = '';
    timeTo: string = '';

    // UI State (Pending Changes)
    tempSelectedDate: Date | null = null;
    tempTimeFrom: string = '';
    tempTimeTo: string = '';

    currentMonth: Date = new Date();
    filterMode: 'client' | 'server' = 'client';

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
        this.generateYears();
        this.generateCalendar();
    }

    // Called every time the popup opens
    afterGuiAttached(params?: any): void {
        // Sync UI state with Applied state
        this.tempSelectedDate = this.selectedDate ? new Date(this.selectedDate) : null;
        this.tempTimeFrom = this.timeFrom;
        this.tempTimeTo = this.timeTo;

        // Reset calendar view to currently selected date or today
        this.currentMonth = this.tempSelectedDate ? new Date(this.tempSelectedDate) : new Date();
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

        const selectedDateStr = this.formatDate(this.selectedDate!);
        return cellValue.toString().startsWith(selectedDateStr);
    }

    getModel() {
        return this.isFilterActive() ? {
            date: this.formatDate(this.selectedDate!),
            timeFrom: this.timeFrom,
            timeTo: this.timeTo,
            mode: this.filterMode
        } : null;
    }

    setModel(model: any): void {
        if (model && model.date) {
            this.selectedDate = new Date(model.date);
            this.timeFrom = model.timeFrom || '';
            this.timeTo = model.timeTo || '';

            // Also sync temp state immediately just in case
            this.tempSelectedDate = new Date(this.selectedDate);
            this.tempTimeFrom = this.timeFrom;
            this.tempTimeTo = this.timeTo;
            this.currentMonth = new Date(this.selectedDate);
            this.generateCalendar();
        } else {
            this.selectedDate = null;
            this.timeFrom = '';
            this.timeTo = '';

            this.tempSelectedDate = null;
            this.tempTimeFrom = '';
            this.tempTimeTo = '';
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
        // Update TEMP state only
        this.tempSelectedDate = new Date(day.year, day.month, day.day);

        if (day.month !== this.currentMonth.getMonth()) {
            this.currentMonth = new Date(day.year, day.month, 1);
            this.generateCalendar();
        }
    }

    isSelectedDay(day: CalendarDay): boolean {
        // Check against TEMP state
        if (!this.tempSelectedDate) return false;
        return day.day === this.tempSelectedDate.getDate() &&
            day.month === this.tempSelectedDate.getMonth() &&
            day.year === this.tempSelectedDate.getFullYear();
    }

    isToday(day: CalendarDay): boolean {
        const today = new Date();
        return day.day === today.getDate() &&
            day.month === today.getMonth() &&
            day.year === today.getFullYear();
    }

    onApply(): void {
        // Commit changes: Temp -> Applied
        this.selectedDate = this.tempSelectedDate;
        this.timeFrom = this.tempTimeFrom;
        this.timeTo = this.tempTimeTo;

        if (this.selectedDate) {
            if (this.filterMode === 'server') {
                if (this.params.onFilterChange) {
                    this.params.onFilterChange(
                        this.formatDate(this.selectedDate),
                        this.timeFrom,
                        this.timeTo
                    );
                }
            } else {
                this.params.filterChangedCallback();
            }
        }
        // Ideally close popup here
        this.params.api.hidePopupMenu();
    }

    onCancel(): void {
        // Clear filter
        this.selectedDate = null;
        this.timeFrom = '';
        this.timeTo = '';
        // Reset temp state
        this.tempSelectedDate = null;
        this.tempTimeFrom = '';
        this.tempTimeTo = '';

        this.currentMonth = new Date();
        this.generateCalendar();

        if (this.filterMode === 'server') {
            if (this.params.onFilterChange) {
                this.params.onFilterChange('');
            }
        } else {
            this.params.filterChangedCallback();
        }
        this.params.api.hidePopupMenu();
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
