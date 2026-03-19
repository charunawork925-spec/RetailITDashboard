// services/filter.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  FilterState,
  DatePreset,
  ComparisonType,
} from '../models/filter.model';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filterState = new BehaviorSubject<FilterState>(
    this.getDefaultFilterState(),
  );
  filterState$ = this.filterState.asObservable();

  //separate observable for date range changes that components can subscribe to
  private dateRangeChanged = new BehaviorSubject<DatePreset>('last7days');
  dateRangeChanged$ = this.dateRangeChanged.asObservable();

  availableCustomers$ = new BehaviorSubject<any[]>([]);

  private widgetFilterMap = new Map<string, string[]>();

  constructor() {
    this.initializeWidgetFilterMap();
  }

  private getDefaultFilterState(): FilterState {
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);

    return {
      dateRange: {
        start: last7Days,
        end: today,
        preset: 'last7days',
      },
      comparison: 'previous_period',
      customerType: 'all',
      productCategory: 'all',
      branch: 'all',
      paymentMethod: 'all',
      timeOfDay: 'all',
      dayOfWeek: 'all',
      promotionType: 'all',
      storePerformance: 'all',
      inventoryStatus: 'all',
      wastageCategory: 'all',
      customerId: 'all',
    };
  }

  private initializeWidgetFilterMap() {
    // Sales widgets
    this.widgetFilterMap.set('sales-metrics', [
      'dateRange',
      'comparison',
      'branch',
    ]);
    this.widgetFilterMap.set('sales-trend', [
      'dateRange',
      'comparison',
      'customerType',
      'productCategory',
      'branch',
      'paymentMethod',
      'timeOfDay',
      'dayOfWeek',
      'promotionType',
      'customerId',
    ]);
    this.widgetFilterMap.set('top-products', [
      'dateRange',
      'productCategory',
      'branch',
    ]);
    this.widgetFilterMap.set('branch-performance', ['dateRange', 'branch']);
    this.widgetFilterMap.set('payment-methods', ['dateRange', 'branch']);

    // Customer widgets
    this.widgetFilterMap.set('customer-segments', [
      'dateRange',
      'customerType',
    ]);
    this.widgetFilterMap.set('top-customers', ['dateRange', 'customerType']);
    this.widgetFilterMap.set('customer-retention', [
      'dateRange',
      'customerType',
    ]);
    this.widgetFilterMap.set('customer-satisfaction', [
      'dateRange',
      'customerType',
    ]);

    // Inventory widgets
    this.widgetFilterMap.set('inventory-alerts', ['branch', 'inventoryStatus']);
    this.widgetFilterMap.set('stock-levels', ['branch', 'inventoryStatus']);
    this.widgetFilterMap.set('top-brands', ['dateRange', 'productCategory']);

    // Promotions widgets
    this.widgetFilterMap.set('active-promotions', ['promotionType']);
    this.widgetFilterMap.set('promo-performance', [
      'dateRange',
      'promotionType',
    ]);
    this.widgetFilterMap.set('promo-summary', ['dateRange', 'promotionType']);

    // Profitability widgets
    this.widgetFilterMap.set('profit-overview', ['dateRange', 'branch']);
    this.widgetFilterMap.set('category-profit', [
      'dateRange',
      'productCategory',
    ]);
    this.widgetFilterMap.set('store-performance', [
      'dateRange',
      'branch',
      'storePerformance',
    ]);
    this.widgetFilterMap.set('profit-margin', ['dateRange', 'branch']);

    // Wastage widgets
    this.widgetFilterMap.set('wastage-summary', [
      'dateRange',
      'branch',
      'wastageCategory',
    ]);
    this.widgetFilterMap.set('wastage-trend', [
      'dateRange',
      'branch',
      'wastageCategory',
    ]);
    this.widgetFilterMap.set('wastage-by-category', [
      'dateRange',
      'branch',
      'wastageCategory',
    ]);
  }

  getFiltersForWidget(widgetId: string): string[] {
    return this.widgetFilterMap.get(widgetId) || ['dateRange'];
  }

  updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    console.log(`Updating filter ${String(key)}:`, value);
    const currentState = this.filterState.value;
    this.filterState.next({
      ...currentState,
      [key]: value,
    });
  }

  updateDateRange(preset: DatePreset, start?: Date | null, end?: Date | null) {
    console.log('🔴 FilterService.updateDateRange:', { preset, start, end });

    let calculatedStart = start;
    let calculatedEnd = end || new Date();

    // Calculate dates based on preset if not provided
    if (!calculatedStart) {
      const today = new Date();
      calculatedEnd = today;

      switch (preset) {
        case 'today':
          calculatedStart = new Date(today.setHours(0, 0, 0, 0));
          break;
        case 'yesterday':
          calculatedStart = new Date(today);
          calculatedStart.setDate(today.getDate() - 1);
          calculatedStart.setHours(0, 0, 0, 0);
          calculatedEnd = new Date(today);
          calculatedEnd.setDate(today.getDate() - 1);
          calculatedEnd.setHours(23, 59, 59, 999);
          break;
        case 'last7days':
          calculatedStart = new Date(today);
          calculatedStart.setDate(today.getDate() - 7);
          calculatedStart.setHours(0, 0, 0, 0);
          break;
        case 'last30days':
          calculatedStart = new Date(today);
          calculatedStart.setDate(today.getDate() - 30);
          calculatedStart.setHours(0, 0, 0, 0);
          break;
        case 'thisMonth':
          calculatedStart = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'lastMonth':
          calculatedStart = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1,
          );
          calculatedEnd = new Date(
            today.getFullYear(),
            today.getMonth(),
            0,
            23,
            59,
            59,
            999,
          );
          break;
        case 'thisYear':
          calculatedStart = new Date(today.getFullYear(), 0, 1);
          break;
        case 'lastYear':
          calculatedStart = new Date(today.getFullYear() - 1, 0, 1);
          calculatedEnd = new Date(
            today.getFullYear() - 1,
            11,
            31,
            23,
            59,
            59,
            999,
          );
          break;
        default:
          calculatedStart = new Date(today);
          calculatedStart.setDate(today.getDate() - 7);
      }
    }

    const currentState = this.filterState.value;
    const newState = {
      ...currentState,
      dateRange: {
        preset,
        start: calculatedStart,
        end: calculatedEnd,
      },
    };

    console.log('🟣 New filter state:', newState);
    this.filterState.next(newState);

    // Emit the date range change separately for components that need to reload data
    this.dateRangeChanged.next(preset);
  }

  // updateDateRange(preset: DatePreset, start?: Date | null, end?: Date | null) {
  //   console.log('Updating date range:', { preset, start, end });

  //   let calculatedStart = start;
  //   let calculatedEnd = end || new Date();

  //   // Calculate dates based on preset if not provided
  //   if (!calculatedStart) {
  //     const today = new Date();
  //     calculatedEnd = today;

  //     switch (preset) {
  //       case 'today':
  //         calculatedStart = new Date(today.setHours(0, 0, 0, 0));
  //         break;
  //       case 'yesterday':
  //         calculatedStart = new Date(today);
  //         calculatedStart.setDate(today.getDate() - 1);
  //         calculatedStart.setHours(0, 0, 0, 0);
  //         calculatedEnd = new Date(today);
  //         calculatedEnd.setDate(today.getDate() - 1);
  //         calculatedEnd.setHours(23, 59, 59, 999);
  //         break;
  //       case 'last7days':
  //         calculatedStart = new Date(today);
  //         calculatedStart.setDate(today.getDate() - 7);
  //         calculatedStart.setHours(0, 0, 0, 0);
  //         break;
  //       case 'last30days':
  //         calculatedStart = new Date(today);
  //         calculatedStart.setDate(today.getDate() - 30);
  //         calculatedStart.setHours(0, 0, 0, 0);
  //         break;
  //       case 'thisMonth':
  //         calculatedStart = new Date(today.getFullYear(), today.getMonth(), 1);
  //         break;
  //       case 'lastMonth':
  //         calculatedStart = new Date(
  //           today.getFullYear(),
  //           today.getMonth() - 1,
  //           1,
  //         );
  //         calculatedEnd = new Date(
  //           today.getFullYear(),
  //           today.getMonth(),
  //           0,
  //           23,
  //           59,
  //           59,
  //           999,
  //         );
  //         break;
  //       case 'thisQuarter':
  //         const quarter = Math.floor(today.getMonth() / 3);
  //         calculatedStart = new Date(today.getFullYear(), quarter * 3, 1);
  //         break;
  //       case 'lastQuarter':
  //         const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
  //         const year =
  //           lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
  //         const quarterIndex = lastQuarter < 0 ? 3 : lastQuarter;
  //         calculatedStart = new Date(year, quarterIndex * 3, 1);
  //         calculatedEnd = new Date(
  //           year,
  //           quarterIndex * 3 + 3,
  //           0,
  //           23,
  //           59,
  //           59,
  //           999,
  //         );
  //         break;
  //       case 'thisYear':
  //         calculatedStart = new Date(today.getFullYear(), 0, 1);
  //         break;
  //       case 'lastYear':
  //         calculatedStart = new Date(today.getFullYear() - 1, 0, 1);
  //         calculatedEnd = new Date(
  //           today.getFullYear() - 1,
  //           11,
  //           31,
  //           23,
  //           59,
  //           59,
  //           999,
  //         );
  //         break;
  //       default:
  //         calculatedStart = new Date(today);
  //         calculatedStart.setDate(today.getDate() - 7);
  //     }
  //   }

  //   const currentState = this.filterState.value;
  //   this.filterState.next({
  //     ...currentState,
  //     dateRange: {
  //       preset,
  //       start: calculatedStart,
  //       end: calculatedEnd,
  //     },
  //   });
  // }

  updateCustomerList(customers: any[]) {
    this.availableCustomers$.next(customers);
  }

  resetFilters() {
    this.filterState.next(this.getDefaultFilterState());
  }
}
