// components/filter-bar/filter-bar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../services/filter.service';
import { Subject, takeUntil } from 'rxjs';
import {
  FilterState,
  DatePreset,
  ComparisonType,
} from '../../models/filter.model';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-bar-container">
      <!-- Date & Time Section -->
      <div class="filter-section">
        <div class="section-header">
          <span class="section-icon">📅</span>
          <span class="section-title">Date & Time</span>
        </div>
        <div class="section-content">
          <!-- Quick Date Presets -->
          <div class="filter-group">
            <span class="filter-label">Period:</span>
            <div class="date-presets">
              <button
                *ngFor="let preset of datePresets"
                class="preset-btn"
                [class.active]="filterState.dateRange.preset === preset.value"
                (click)="setDatePreset(preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div
            class="filter-group"
            *ngIf="filterState.dateRange.preset === 'custom'"
          >
            <input
              type="date"
              class="date-input"
              [ngModel]="filterState.dateRange.start | date: 'yyyy-MM-dd'"
              (ngModelChange)="updateCustomDate('start', $event)"
            />
            <span class="date-sep">to</span>
            <input
              type="date"
              class="date-input"
              [ngModel]="filterState.dateRange.end | date: 'yyyy-MM-dd'"
              (ngModelChange)="updateCustomDate('end', $event)"
            />
          </div>

          <!-- Comparison Type -->
          <div class="filter-group">
            <span class="filter-label">Compare:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.comparison"
              (ngModelChange)="updateFilter('comparison', $event)"
            >
              <option *ngFor="let opt of comparisonOptions" [value]="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Time of Day Filter -->
          <div class="filter-group">
            <span class="filter-label">Time:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.timeOfDay"
              (ngModelChange)="updateFilter('timeOfDay', $event)"
            >
              <option *ngFor="let opt of timeOfDayOptions" [value]="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Day of Week Filter -->
          <div class="filter-group">
            <span class="filter-label">Day:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.dayOfWeek"
              (ngModelChange)="updateFilter('dayOfWeek', $event)"
            >
              <option *ngFor="let opt of dayOfWeekOptions" [value]="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Customer Section -->
      <div class="filter-section">
        <div class="section-header">
          <span class="section-icon">👥</span>
          <span class="section-title">Customer</span>
        </div>
        <div class="section-content">
          <!-- Individual Customer Filter -->
          <div class="filter-group">
            <span class="filter-label">Customer:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.customerId"
              (ngModelChange)="updateFilter('customerId', $event)"
            >
              <option value="all">All Customers</option>
              <option *ngFor="let c of availableCustomers" [value]="c.name">
                {{ c.name }}
                <span *ngIf="c.type"> — {{ c.type }}</span>
              </option>
            </select>
          </div>

          <!-- Customer Type Filter -->
          <div class="filter-group">
            <span class="filter-label">Type:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.customerType"
              (ngModelChange)="updateFilter('customerType', $event)"
            >
              <option
                *ngFor="let opt of customerTypeOptions"
                [value]="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Product Section -->
      <div class="filter-section">
        <div class="section-header">
          <span class="section-icon">📦</span>
          <span class="section-title">Product</span>
        </div>
        <div class="section-content">
          <!-- Product Category Filter -->
          <div class="filter-group">
            <span class="filter-label">Category:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.productCategory"
              (ngModelChange)="updateFilter('productCategory', $event)"
            >
              <option
                *ngFor="let opt of productCategoryOptions"
                [value]="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Inventory Status Filter -->
          <div class="filter-group">
            <span class="filter-label">Inventory:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.inventoryStatus"
              (ngModelChange)="updateFilter('inventoryStatus', $event)"
            >
              <option
                *ngFor="let opt of inventoryStatusOptions"
                [value]="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Wastage Category Filter -->
          <div class="filter-group">
            <span class="filter-label">Waste:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.wastageCategory"
              (ngModelChange)="updateFilter('wastageCategory', $event)"
            >
              <option
                *ngFor="let opt of wastageCategoryOptions"
                [value]="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Location Section -->
      <div class="filter-section">
        <div class="section-header">
          <span class="section-icon">📍</span>
          <span class="section-title">Location</span>
        </div>
        <div class="section-content">
          <!-- Branch Filter -->
          <div class="filter-group">
            <span class="filter-label">Branch:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.branch"
              (ngModelChange)="updateFilter('branch', $event)"
            >
              <option *ngFor="let opt of branchOptions" [value]="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Store Performance Filter -->
          <div class="filter-group">
            <span class="filter-label">Performance:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.storePerformance"
              (ngModelChange)="updateFilter('storePerformance', $event)"
            >
              <option
                *ngFor="let opt of storePerformanceOptions"
                [value]="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Transaction Section -->
      <div class="filter-section">
        <div class="section-header">
          <span class="section-icon">💳</span>
          <span class="section-title">Transaction</span>
        </div>
        <div class="section-content">
          <!-- Payment Method Filter -->
          <div class="filter-group">
            <span class="filter-label">Payment:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.paymentMethod"
              (ngModelChange)="updateFilter('paymentMethod', $event)"
            >
              <option
                *ngFor="let opt of paymentMethodOptions"
                [value]="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Promotion Type Filter -->
          <div class="filter-group">
            <span class="filter-label">Promo:</span>
            <select
              class="filter-select"
              [ngModel]="filterState.promotionType"
              (ngModelChange)="updateFilter('promotionType', $event)"
            >
              <option
                *ngFor="let opt of promotionTypeOptions"
                [value]="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="filter-actions">
        <button
          class="reset-btn"
          (click)="resetFilters()"
          *ngIf="hasActiveFilters()"
        >
          <span class="material-icons">refresh</span>
          Reset All Filters
        </button>

        <!-- Active Filters Display -->
        <div class="active-filters" *ngIf="getActiveFiltersCount() > 0">
          <span class="filter-badge" *ngFor="let filter of getActiveFilters()">
            {{ filter }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .filter-bar-container {
        background: #ffffff;
        border: 1px solid #e2e6f0;
        border-radius: 16px;
        margin-bottom: 24px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.06);
      }

      .filter-section {
        border-bottom: 1px solid #f0f2f8;
        padding: 16px 20px;
      }

      .filter-section:last-of-type {
        border-bottom: none;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #eef2ff;
      }

      .section-icon {
        font-size: 18px;
      }

      .section-title {
        font-size: 14px;
        font-weight: 700;
        color: #1f2a4a;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .section-content {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f8f9fd;
        padding: 4px 12px;
        border-radius: 8px;
        border: 1px solid #e2e6f0;
        transition: all 0.2s;
      }

      .filter-group:hover {
        border-color: #cbd5e1;
        background: #ffffff;
      }

      .filter-label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7a99;
        padding: 0 4px;
        white-space: nowrap;
      }

      .date-presets {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .preset-btn {
        padding: 6px 12px;
        border: none;
        background: transparent;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        color: #6b7a99;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .preset-btn:hover {
        background: #e2e6f0;
        color: #1a1f2e;
      }

      .preset-btn.active {
        background: #6366f1;
        color: white;
      }

      .date-input {
        padding: 6px 10px;
        border: 1px solid #e2e6f0;
        border-radius: 6px;
        font-size: 12px;
        color: #1a1f2e;
        background: white;
      }

      .date-sep {
        color: #6b7a99;
        font-size: 12px;
      }

      .filter-select {
        padding: 6px 10px;
        border: 1px solid #e2e6f0;
        border-radius: 6px;
        background: white;
        font-size: 12px;
        color: #1a1f2e;
        min-width: 130px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .filter-select:hover {
        border-color: #6366f1;
      }

      .filter-select:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
      }

      .filter-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        background: #fafbff;
        border-top: 1px solid #eef2ff;
      }

      .reset-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border: 1px solid #ef4444;
        background: rgba(239, 68, 68, 0.05);
        border-radius: 8px;
        color: #ef4444;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .reset-btn:hover {
        background: rgba(239, 68, 68, 0.15);
        transform: translateY(-1px);
      }

      .reset-btn .material-icons {
        font-size: 14px;
      }

      .active-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .filter-badge {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.3px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .filter-section {
          padding: 12px 16px;
        }

        .section-content {
          gap: 8px;
        }

        .filter-group {
          flex-wrap: wrap;
          padding: 6px 10px;
        }

        .filter-select {
          min-width: 100px;
        }

        .date-presets {
          gap: 2px;
        }

        .preset-btn {
          padding: 4px 8px;
          font-size: 11px;
        }

        .filter-actions {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
        }

        .active-filters {
          justify-content: center;
        }
      }

      @media (max-width: 480px) {
        .section-content {
          flex-direction: column;
          align-items: stretch;
        }

        .filter-group {
          justify-content: space-between;
        }

        .filter-select {
          flex: 1;
        }
      }
    `,
  ],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  filterState!: FilterState;
  availableCustomers: any[] = [];

  datePresets: { value: DatePreset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'lastQuarter', label: 'Last Quarter' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom' },
  ];

  comparisonOptions: { value: ComparisonType; label: string }[] = [
    { value: 'none', label: 'No Comparison' },
    { value: 'previous_period', label: 'Previous Period' },
    { value: 'previous_year', label: 'Previous Year' },
    { value: 'target', label: 'vs Target' },
  ];

  customerTypeOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'premium', label: 'Premium' },
    { value: 'regular', label: 'Regular' },
    { value: 'occasional', label: 'Occasional' },
    { value: 'new', label: 'New' },
  ];

  productCategoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'fmcg', label: 'FMCG' },
    { value: 'grocery', label: 'Grocery' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'household', label: 'Household' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'apparel', label: 'Apparel' },
  ];

  branchOptions = [
    { value: 'all', label: 'All Branches' },
    { value: 'downtown', label: 'Downtown' },
    { value: 'uptown', label: 'Uptown' },
    { value: 'suburb', label: 'Suburb' },
    { value: 'mall', label: 'Mall' },
    { value: 'kelaniya', label: 'Kelaniya' },
    { value: 'dehiwala', label: 'Dehiwala' },
    { value: 'galle', label: 'Galle' },
    { value: 'negombo', label: 'Negombo' },
  ];

  paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'card', label: 'Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'digital', label: 'Digital Wallet' },
  ];

  timeOfDayOptions = [
    { value: 'all', label: 'All Times' },
    { value: 'morning', label: 'Morning (6-11)' },
    { value: 'afternoon', label: 'Afternoon (12-4)' },
    { value: 'evening', label: 'Evening (5-8)' },
    { value: 'night', label: 'Night (9-11)' },
  ];

  dayOfWeekOptions = [
    { value: 'all', label: 'All Days' },
    { value: 'weekday', label: 'Weekdays' },
    { value: 'weekend', label: 'Weekends' },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  promotionTypeOptions = [
    { value: 'all', label: 'All Promos' },
    { value: 'bogo', label: 'BOGO' },
    { value: 'category_discount', label: 'Category Discount' },
    { value: 'time_based', label: 'Time-based' },
    { value: 'loyalty', label: 'Loyalty' },
  ];

  storePerformanceOptions = [
    { value: 'all', label: 'All Performance' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'average', label: 'Average' },
    { value: 'poor', label: 'Poor' },
  ];

  inventoryStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'critical', label: 'Critical' },
    { value: 'warning', label: 'Warning' },
    { value: 'low', label: 'Low' },
    { value: 'healthy', label: 'Healthy' },
  ];

  wastageCategoryOptions = [
    { value: 'all', label: 'All Waste' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'produce', label: 'Produce' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'meat', label: 'Meat' },
  ];

  constructor(
    private filterService: FilterService,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit() {
    this.filterService.filterState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.filterState = state;
      });

    this.analyticsService
      .getCompleteAnalytics('today')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.availableCustomers = data.dashboard.topCustomers;
        console.log('👥 Customers loaded:', this.availableCustomers);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    this.filterService.updateFilter(key, value);
  }

  setDatePreset(preset: DatePreset) {
    this.filterService.updateDateRange(preset);
  }

  updateCustomDate(type: 'start' | 'end', value: string) {
    const date = value ? new Date(value) : null;
    const currentRange = this.filterState.dateRange;

    this.filterService.updateDateRange(
      'custom',
      type === 'start' ? date : currentRange.start,
      type === 'end' ? date : currentRange.end,
    );
  }

  resetFilters() {
    this.filterService.resetFilters();
  }

  hasActiveFilters(): boolean {
    return this.getActiveFiltersCount() > 0;
  }

  getActiveFiltersCount(): number {
    let count = 0;
    const state = this.filterState;

    if (state.customerType !== 'all') count++;
    if (state.customerId !== 'all') count++;
    if (state.productCategory !== 'all') count++;
    if (state.branch !== 'all') count++;
    if (state.paymentMethod !== 'all') count++;
    if (state.timeOfDay !== 'all') count++;
    if (state.dayOfWeek !== 'all') count++;
    if (state.promotionType !== 'all') count++;
    if (state.storePerformance !== 'all') count++;
    if (state.inventoryStatus !== 'all') count++;
    if (state.wastageCategory !== 'all') count++;

    return count;
  }

  getActiveFilters(): string[] {
    const active: string[] = [];
    const state = this.filterState;

    if (state.customerId !== 'all') {
      active.push(`Customer: ${state.customerId}`);
    }
    if (state.customerType !== 'all') {
      const opt = this.customerTypeOptions.find(
        (o) => o.value === state.customerType,
      );
      if (opt) active.push(`Type: ${opt.label}`);
    }
    if (state.productCategory !== 'all') {
      const opt = this.productCategoryOptions.find(
        (o) => o.value === state.productCategory,
      );
      if (opt) active.push(`Category: ${opt.label}`);
    }
    if (state.branch !== 'all') {
      const opt = this.branchOptions.find((o) => o.value === state.branch);
      if (opt) active.push(`Branch: ${opt.label}`);
    }
    if (state.paymentMethod !== 'all') {
      const opt = this.paymentMethodOptions.find(
        (o) => o.value === state.paymentMethod,
      );
      if (opt) active.push(`Payment: ${opt.label}`);
    }
    if (state.timeOfDay !== 'all') {
      const opt = this.timeOfDayOptions.find(
        (o) => o.value === state.timeOfDay,
      );
      if (opt) active.push(`Time: ${opt.label}`);
    }
    if (state.dayOfWeek !== 'all') {
      const opt = this.dayOfWeekOptions.find(
        (o) => o.value === state.dayOfWeek,
      );
      if (opt) active.push(`Day: ${opt.label}`);
    }
    if (state.promotionType !== 'all') {
      const opt = this.promotionTypeOptions.find(
        (o) => o.value === state.promotionType,
      );
      if (opt) active.push(`Promo: ${opt.label}`);
    }
    if (state.storePerformance !== 'all') {
      const opt = this.storePerformanceOptions.find(
        (o) => o.value === state.storePerformance,
      );
      if (opt) active.push(`Performance: ${opt.label}`);
    }
    if (state.inventoryStatus !== 'all') {
      const opt = this.inventoryStatusOptions.find(
        (o) => o.value === state.inventoryStatus,
      );
      if (opt) active.push(`Inventory: ${opt.label}`);
    }
    if (state.wastageCategory !== 'all') {
      const opt = this.wastageCategoryOptions.find(
        (o) => o.value === state.wastageCategory,
      );
      if (opt) active.push(`Waste: ${opt.label}`);
    }

    return active;
  }
}
