// shared/base-filtered-widget.component.ts
import {
  Directive,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FilterService } from '../services/filter.service';
import { FilterState } from '../models/filter.model';

@Directive()
export abstract class BaseFilteredWidgetComponent
  implements OnInit, OnDestroy, OnChanges
{
  protected destroy$ = new Subject<void>();
  protected filterState!: FilterState;

  @Input() widgetId: string = '';
  @Input() widgetTopic: string = '';
  @Input() data: any;

  constructor(protected filterService: FilterService) {}

  ngOnInit() {
    this.filterService.filterState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.filterState = state;
        this.onFiltersChanged(state);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      if (this.filterState) {
        this.onFiltersChanged(this.filterState);
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected abstract onFiltersChanged(filters: FilterState): void;

  protected shouldApplyFilter(filterType: string): boolean {
    const applicableFilters = this.filterService.getFiltersForWidget(
      this.widgetId,
    );
    return applicableFilters.includes(filterType);
  }

  protected getFilterLabel(filterType: string, value: string): string {
    const filterLabels: Record<string, Record<string, string>> = {
      // NEW — customerId labels are dynamic (customer names), so we just
      // return the value itself as the label; the badge will show the name
      customerId: {},
      customerType: {
        all: 'All Customers',
        premium: 'Premium',
        regular: 'Regular',
        occasional: 'Occasional',
        new: 'New',
      },
      productCategory: {
        all: 'All Categories',
        dairy: 'Dairy',
        fmcg: 'FMCG',
        grocery: 'Grocery',
        beverages: 'Beverages',
        household: 'Household',
        electronics: 'Electronics',
        apparel: 'Apparel',
      },
      branch: {
        all: 'All Branches',
        downtown: 'Downtown',
        uptown: 'Uptown',
        suburb: 'Suburb',
        mall: 'Mall',
        kelaniya: 'Kelaniya',
        dehiwala: 'Dehiwala',
        galle: 'Galle',
        negombo: 'Negombo',
      },
      paymentMethod: {
        all: 'All Methods',
        card: 'Card',
        cash: 'Cash',
        digital: 'Digital Wallet',
      },
      timeOfDay: {
        all: 'All Times',
        morning: 'Morning',
        afternoon: 'Afternoon',
        evening: 'Evening',
        night: 'Night',
      },
      dayOfWeek: {
        all: 'All Days',
        weekday: 'Weekdays',
        weekend: 'Weekends',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
      },
      promotionType: {
        all: 'All Promos',
        bogo: 'BOGO',
        category_discount: 'Category Discount',
        time_based: 'Time-based',
        loyalty: 'Loyalty',
      },
      storePerformance: {
        all: 'All Performance',
        excellent: 'Excellent',
        good: 'Good',
        average: 'Average',
        poor: 'Poor',
      },
      inventoryStatus: {
        all: 'All Status',
        critical: 'Critical',
        warning: 'Warning',
        low: 'Low',
        healthy: 'Healthy',
      },
      wastageCategory: {
        all: 'All Waste',
        dairy: 'Dairy',
        produce: 'Produce',
        bakery: 'Bakery',
        meat: 'Meat',
      },
    };

    // For customerId the value IS the display label (it's the customer's name)
    if (filterType === 'customerId') return value;

    return filterLabels[filterType]?.[value] || value;
  }

  protected getActiveFilters(): { type: string; label: string }[] {
    if (!this.filterState) return [];

    const active: { type: string; label: string }[] = [];
    const filters = this.filterState;

    const applicableFilters = this.filterService.getFiltersForWidget(
      this.widgetId,
    );

    applicableFilters.forEach((filterType) => {
      const value = filters[filterType as keyof FilterState];
      if (value && value !== 'all' && typeof value === 'string') {
        const label = this.getFilterLabel(filterType, value);
        // For customerId, label === value (the name), which is always
        // different from 'all', so it will always be included when set
        active.push({ type: filterType, label });
      }
    });

    return active;
  }

  protected hasActiveFilters(): boolean {
    return this.getActiveFilters().length > 0;
  }

  protected getActiveFilterCount(): number {
    return this.getActiveFilters().length;
  }

  protected getActiveFiltersTooltip(): string {
    const active = this.getActiveFilters();
    if (active.length === 0) return '';
    return active.map((f) => f.label).join(' • ');
  }
}
