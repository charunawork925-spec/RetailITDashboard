import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';
import { BaseFilteredWidgetComponent } from '../../shared/base-filtered-widget.component';
import { FilterService } from '../../services/filter.service';
import { FilterState } from '../../models/filter.model';

@Component({
  selector: 'app-sales-metrics-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper
      title="Sales Metrics"
      icon="trending_up"
      [showFilters]="true"
      [hasActiveFilters]="hasActiveFilters()"
      [activeFilterCount]="getActiveFilterCount()"
      [activeFiltersTooltip]="getActiveFiltersTooltip()"
      [activeFilters]="getActiveFilters()"
    >
      <div class="metrics-grid">
        <div class="metric-card" *ngFor="let m of filteredMetrics">
          <div class="metric-label">{{ m.label }}</div>
          <div class="metric-value">{{ m.value }}</div>
          <div
            class="metric-change"
            [class.up]="m.change > 0"
            [class.down]="m.change < 0"
            [class.neutral]="m.change === 0"
          >
            <span class="material-icons" *ngIf="m.change !== 0">{{
              m.change > 0 ? 'arrow_upward' : 'arrow_downward'
            }}</span>
            {{ m.changeLabel }}
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .metric-card {
        background: rgba(255, 255, 255, 0.04);
        border-radius: 12px;
        padding: 18px 16px;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }
      .metric-label {
        font-size: 12px;
        color: #8892a4;
        margin-bottom: 8px;
        font-weight: 500;
      }
      .metric-value {
        font-size: 22px;
        font-weight: 800;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
        line-height: 1.1;
      }
      .metric-change {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 12px;
        font-weight: 600;
        margin-top: 8px;
        .material-icons {
          font-size: 14px;
        }
        &.up {
          color: #10b981;
        }
        &.down {
          color: #ef4444;
        }
        &.neutral {
          color: #8892a4;
        }
      }
    `,
  ],
})
export class SalesMetricsWidgetComponent
  extends BaseFilteredWidgetComponent
  implements OnInit
{
  @Input() override data: any = null;
  @Input() override widgetId: string = 'sales-metrics';

  filteredMetrics: any[] = [];
  private originalMetrics: any[] = [];

  constructor(filterService: FilterService) {
    super(filterService);
  }

  override ngOnInit() {
    super.ngOnInit();
    // Initialize filtered metrics with original data if available
    if (this.originalMetrics.length > 0) {
      this.applyFilters(this.filterState);
    }
  }

  override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    if (changes['data'] && this.data) {
      // Store original metrics when data changes
      this.originalMetrics = Object.values(this.data);

      // Only apply filters if filterState is initialized
      if (this.filterState) {
        this.applyFilters(this.filterState);
      } else {
        // If no filter state yet, just display original metrics
        this.filteredMetrics = this.originalMetrics;
      }
    }
  }

  protected override onFiltersChanged(filters: FilterState) {
    // Check if filters object exists and we have data
    if (filters && this.originalMetrics.length > 0) {
      this.applyFilters(filters);
    }
  }

  private applyFilters(filters: FilterState) {
    // Guard clause - ensure filters exists
    if (!filters) {
      console.warn('SalesMetricsWidget: No filter state available');
      this.filteredMetrics = this.originalMetrics;
      return;
    }

    let metrics = [...this.originalMetrics];

    // Apply branch filter - with null check
    if (
      this.shouldApplyFilter('branch') &&
      filters.branch &&
      filters.branch !== 'all'
    ) {
      metrics = this.filterByBranch(metrics, filters.branch);
    }

    // Apply customer type filter - with null check
    if (
      this.shouldApplyFilter('customerType') &&
      filters.customerType &&
      filters.customerType !== 'all'
    ) {
      metrics = this.filterByCustomerType(metrics, filters.customerType);
    }

    // Apply product category filter - with null check
    if (
      this.shouldApplyFilter('productCategory') &&
      filters.productCategory &&
      filters.productCategory !== 'all'
    ) {
      metrics = this.filterByCategory(metrics, filters.productCategory);
    }

    // Apply customer ID filter - with null check
    if (
      this.shouldApplyFilter('customerId') &&
      filters.customerId &&
      filters.customerId !== 'all'
    ) {
      metrics = this.filterByCustomer(metrics, filters.customerId);
    }

    // Apply payment method filter - with null check
    if (
      this.shouldApplyFilter('paymentMethod') &&
      filters.paymentMethod &&
      filters.paymentMethod !== 'all'
    ) {
      metrics = this.filterByPaymentMethod(metrics, filters.paymentMethod);
    }

    this.filteredMetrics = metrics;
  }

  // Filter methods - with error handling
  private filterByBranch(metrics: any[], branch: string): any[] {
    try {
      const branchMultipliers: Record<string, number> = {
        downtown: 1.2,
        uptown: 1.1,
        suburb: 0.8,
        mall: 1.0,
        kelaniya: 0.9,
        dehiwala: 0.95,
        galle: 0.7,
        negombo: 0.85,
      };

      const multiplier = branchMultipliers[branch] || 1.0;
      return metrics.map((metric) => ({
        ...metric,
        value: this.adjustMetricValue(metric.value, multiplier),
        change: metric.change * multiplier,
      }));
    } catch (error) {
      console.error('Error in filterByBranch:', error);
      return metrics;
    }
  }

  private filterByCustomerType(metrics: any[], customerType: string): any[] {
    try {
      const typeMultipliers: Record<string, number> = {
        premium: 1.3,
        regular: 1.0,
        occasional: 0.7,
        new: 0.5,
      };

      const multiplier = typeMultipliers[customerType] || 1.0;
      return metrics.map((metric) => ({
        ...metric,
        value: this.adjustMetricValue(metric.value, multiplier),
        change: metric.change * multiplier,
      }));
    } catch (error) {
      console.error('Error in filterByCustomerType:', error);
      return metrics;
    }
  }

  private filterByCategory(metrics: any[], category: string): any[] {
    try {
      const categoryMultipliers: Record<string, number> = {
        dairy: 0.25,
        fmcg: 0.2,
        grocery: 0.15,
        beverages: 0.12,
        household: 0.1,
        electronics: 0.08,
        apparel: 0.05,
      };

      const multiplier = categoryMultipliers[category] || 1.0;
      return metrics.map((metric) => ({
        ...metric,
        value: this.adjustMetricValue(metric.value, multiplier),
        change: metric.change * multiplier,
      }));
    } catch (error) {
      console.error('Error in filterByCategory:', error);
      return metrics;
    }
  }

  private filterByCustomer(metrics: any[], customerId: string): any[] {
    try {
      const customerSpendMultiplier = 0.05;
      return metrics.map((metric) => ({
        ...metric,
        value: this.adjustMetricValue(metric.value, customerSpendMultiplier),
        change: metric.change * customerSpendMultiplier,
      }));
    } catch (error) {
      console.error('Error in filterByCustomer:', error);
      return metrics;
    }
  }

  private filterByPaymentMethod(metrics: any[], paymentMethod: string): any[] {
    try {
      const methodMultipliers: Record<string, number> = {
        card: 0.65,
        cash: 0.26,
        digital: 0.09,
      };

      const multiplier = methodMultipliers[paymentMethod] || 1.0;
      return metrics.map((metric) => ({
        ...metric,
        value: this.adjustMetricValue(metric.value, multiplier),
        change: metric.change * multiplier,
      }));
    } catch (error) {
      console.error('Error in filterByPaymentMethod:', error);
      return metrics;
    }
  }

  private adjustMetricValue(value: any, multiplier: number): any {
    if (!value) return value;

    try {
      if (typeof value === 'number') {
        return Math.round(value * multiplier);
      }

      if (typeof value === 'string') {
        // Handle currency strings like "Rs. 24,563"
        const match = value.match(/[\d,]+/);
        if (match) {
          const numericValue = parseFloat(match[0].replace(/,/g, ''));
          const adjustedValue = Math.round(numericValue * multiplier);
          return value.replace(/[\d,]+/, adjustedValue.toLocaleString());
        }
      }

      return value;
    } catch (error) {
      console.error('Error adjusting metric value:', error);
      return value;
    }
  }
}
