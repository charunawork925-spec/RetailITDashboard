// widgets/sales/sales-trend-widget.component.ts
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';
import { BaseFilteredWidgetComponent } from '../../shared/base-filtered-widget.component';
import { FilterService } from '../../services/filter.service';
import { FilterState } from '../../models/filter.model';
import { AnalyticsService } from '../../services/analytics.service';
import { TimePeriod } from '../../models/analytics';

@Component({
  selector: 'app-sales-trend-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper
      [title]="'Sales Trend'"
      [icon]="'show_chart'"
      [showFilters]="true"
      [hasActiveFilters]="hasActiveFilters()"
      [activeFilterCount]="getActiveFilterCount()"
      [activeFiltersTooltip]="getActiveFiltersTooltip()"
      [activeFilters]="getActiveFilters()"
    >
      <div class="trend-stats" *ngIf="filteredData">
        <div class="tstat">
          <span class="tstat-val">{{
            formatCurrency(filteredData.total)
          }}</span>
          <span class="tstat-label">Total {{ getPeriodLabel() }}</span>
        </div>
        <div class="tstat highlight" *ngIf="comparisonData">
          <span
            class="tstat-val"
            [class.up]="comparisonData.growth > 0"
            [class.down]="comparisonData.growth < 0"
          >
            {{ comparisonData.growth > 0 ? '+' : ''
            }}{{ comparisonData.growth | number: '1.1-1' }}%
          </span>
          <span class="tstat-label">vs {{ getComparisonLabel() }}</span>
        </div>
        <div class="tstat">
          <span class="tstat-val">{{ filteredData.peak.label }}</span>
          <span class="tstat-label">Peak {{ getGranularityLabel() }}</span>
        </div>
      </div>
      <div class="chart-container">
        <canvas
          baseChart
          [data]="chartData"
          [options]="chartOptions"
          type="line"
        ></canvas>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .trend-stats {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }
      .tstat {
        flex: 1;
        padding: 10px 14px;
        background: #f8f9fd;
        border-radius: 10px;
        border: 1px solid #e2e6f0;
      }
      .tstat.highlight {
        background: rgba(99, 102, 241, 0.08);
        border: 1px solid rgba(99, 102, 241, 0.15);
      }
      .tstat-val {
        display: block;
        font-size: 16px;
        font-weight: 800;
        color: #1a1f2e;
        font-family: 'JetBrains Mono', monospace;
      }
      .tstat-val.up {
        color: #10b981;
      }
      .tstat-val.down {
        color: #ef4444;
      }
      .tstat-label {
        display: block;
        font-size: 11px;
        color: #6b7a99;
        margin-top: 3px;
      }
      .chart-container {
        position: relative;
        height: 220px;
        margin-top: 8px;
      }
    `,
  ],
})
export class SalesTrendWidgetComponent
  extends BaseFilteredWidgetComponent
  implements OnInit
{
  @Input() override data: any = null;
  @Input() override widgetId: string = 'sales-trend';

  private previousDataKey: string = '';

  filteredData: any;
  comparisonData: any;
  chartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1f2e',
        borderColor: '#e2e6f0',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#b0bcd4',
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { color: '#6b7a99', font: { size: 11 } },
        border: { color: 'transparent' },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: {
          color: '#6b7a99',
          font: { size: 11 },
          callback: (value) => this.formatCurrency(value as number),
        },
        border: { color: 'transparent' },
      },
    },
    elements: {
      line: { tension: 0.4, borderWidth: 2 },
      point: { radius: 3, hoverRadius: 6, backgroundColor: '#6366f1' },
    },
  };

  constructor(
    filterService: FilterService,
    private analyticsService: AnalyticsService,
  ) {
    super(filterService);
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnChanges(changes: SimpleChanges) {
    console.log('🔵 SalesTrendWidget ngOnChanges:', {
      widgetId: this.widgetId,
      hasData: !!this.data,
      dataLabels: this.data?.labels,
      dataValues: this.data?.actualSales,
      changes: Object.keys(changes).map((key) => ({
        key,
        previous: changes[key].previousValue,
        current: changes[key].currentValue,
        firstChange: changes[key].firstChange,
      })),
    });
    super.ngOnChanges(changes);
  }

  private getDataKey(data: any): string {
    if (!data) return 'no-data';
    return `${data.labels?.join(',')}-${data.actualSales?.join(',')}`;
  }

  // NEW — maps filter preset string to TimePeriod
  private mapPresetToPeriod(preset: string): TimePeriod {
    switch (preset) {
      case 'today':
      case 'yesterday':
        return 'today';
      case 'last7days':
        return 'week';
      case 'last30days':
      case 'thisMonth':
      case 'lastMonth':
        return 'month';
      case 'thisYear':
      case 'lastYear':
        return 'year';
      default:
        return 'week';
    }
  }

  protected override onFiltersChanged(filters: FilterState) {
    console.log('🟢 SalesTrendWidget onFiltersChanged:', {
      widgetId: this.widgetId,
      filters: {
        preset: filters.dateRange.preset,
        comparison: filters.comparison,
        customerId: filters.customerId, // NEW
      },
      hasData: !!this.data,
      dataLabels: this.data?.labels,
      dataTotal: this.data?.actualSales?.reduce(
        (a: number, b: number) => a + b,
        0,
      ),
    });

    if (!this.data) {
      console.log('⚠️ No data available yet');
      return;
    }

    const currentDataKey = this.getDataKey(this.data);
    if (currentDataKey !== this.previousDataKey) {
      console.log('📊 Data content changed:', {
        previous: this.previousDataKey,
        current: currentDataKey,
      });
      this.previousDataKey = currentDataKey;
    }

    // NEW — if an individual customer is selected, fetch their scoped trend
    if (
      this.shouldApplyFilter('customerId') &&
      filters.customerId &&
      filters.customerId !== 'all'
    ) {
      const period = this.mapPresetToPeriod(filters.dateRange.preset);
      this.analyticsService
        .getSalesByCustomer(filters.customerId, period)
        .subscribe((customerTrend) => {
          // Temporarily swap data so applyFilters works on customer-scoped values
          const originalData = this.data;
          this.data = customerTrend;
          this.applyFilters(filters);
          //  this.data = originalData; // restore so period changes still work
        });
    } else {
      this.applyFilters(filters);
    }
  }

  private applyFilters(filters: FilterState) {
    console.log('🟡 Applying filters to data:', {
      originalLabels: this.data?.labels,
      originalValues: this.data?.actualSales,
      originalTotal: this.data?.actualSales?.reduce(
        (a: number, b: number) => a + b,
        0,
      ),
    });

    let filteredSales = this.data?.actualSales
      ? [...this.data.actualSales]
      : [];
    let filteredLabels = this.data?.labels ? [...this.data.labels] : [];

    console.log('📊 Initial filtered data:', {
      labels: filteredLabels,
      values: filteredSales,
      total: filteredSales.reduce((a, b) => a + b, 0),
    });

    if (filteredSales.length === 0) {
      this.filteredData = null;
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    if (this.shouldApplyFilter('branch') && filters.branch !== 'all') {
      console.log('Applying branch filter:', filters.branch);
      filteredSales = this.filterByBranch(filteredSales, filters.branch);
    }

    if (
      this.shouldApplyFilter('customerType') &&
      filters.customerType !== 'all'
    ) {
      console.log('Applying customer type filter:', filters.customerType);
      filteredSales = this.filterByCustomerType(
        filteredSales,
        filters.customerType,
      );
    }

    if (
      this.shouldApplyFilter('productCategory') &&
      filters.productCategory !== 'all'
    ) {
      console.log('Applying product category filter:', filters.productCategory);
      filteredSales = this.filterByCategory(
        filteredSales,
        filters.productCategory,
      );
    }

    if (this.shouldApplyFilter('timeOfDay') && filters.timeOfDay !== 'all') {
      console.log('Applying time of day filter:', filters.timeOfDay);
      [filteredLabels, filteredSales] = this.filterByTimeOfDay(
        filteredLabels,
        filteredSales,
        filters.timeOfDay,
      );
    }

    if (this.shouldApplyFilter('dayOfWeek') && filters.dayOfWeek !== 'all') {
      console.log('Applying day of week filter:', filters.dayOfWeek);
      [filteredLabels, filteredSales] = this.filterByDayOfWeek(
        filteredLabels,
        filteredSales,
        filters.dayOfWeek,
      );
    }

    this.filteredData = {
      labels: filteredLabels,
      values: filteredSales,
      total: filteredSales.reduce((a, b) => a + b, 0),
      peak: {
        label:
          filteredLabels[filteredSales.indexOf(Math.max(...filteredSales))],
        value: Math.max(...filteredSales),
      },
    };

    console.log('✅ Final filtered data:', {
      labels: this.filteredData.labels,
      total: this.filteredData.total,
      peak: this.filteredData.peak,
    });

    if (filters.comparison !== 'none') {
      this.comparisonData = this.getComparisonData(
        filteredSales,
        filters.comparison,
      );
    } else {
      this.comparisonData = null;
    }

    this.updateChart();
  }

  private filterByBranch(data: number[], branch: string): number[] {
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
    return data.map((v) => Math.round(v * multiplier));
  }

  private filterByCustomerType(data: number[], customerType: string): number[] {
    const typeMultipliers: Record<string, number> = {
      premium: 0.4,
      regular: 0.3,
      occasional: 0.2,
      new: 0.1,
    };
    const multiplier = typeMultipliers[customerType] || 1.0;
    return data.map((v) => Math.round(v * multiplier));
  }

  private filterByCategory(data: number[], category: string): number[] {
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
    return data.map((v) => Math.round(v * multiplier));
  }

  private filterByTimeOfDay(
    labels: string[],
    data: number[],
    timeOfDay: string,
  ): [string[], number[]] {
    const timeRanges: Record<string, { start: number; end: number }> = {
      morning: { start: 0, end: 2 },
      afternoon: { start: 2, end: 4 },
      evening: { start: 4, end: 6 },
      night: { start: 6, end: 7 },
    };

    const range = timeRanges[timeOfDay];
    if (!range) return [labels, data];

    return [
      labels.slice(range.start, range.end),
      data.slice(range.start, range.end),
    ];
  }

  private filterByDayOfWeek(
    labels: string[],
    data: number[],
    dayOfWeek: string,
  ): [string[], number[]] {
    const dayIndices: Record<string, number[]> = {
      weekday: [0, 1, 2, 3, 4],
      weekend: [5, 6],
      monday: [0],
      tuesday: [1],
      wednesday: [2],
      thursday: [3],
      friday: [4],
      saturday: [5],
      sunday: [6],
    };

    const indices = dayIndices[dayOfWeek];
    if (!indices) return [labels, data];

    return [indices.map((i) => labels[i]), indices.map((i) => data[i])];
  }

  private getComparisonData(
    currentData: number[],
    comparisonType: string,
  ): any {
    let multiplier = 1;

    switch (comparisonType) {
      case 'previous_period':
        multiplier = 0.9;
        break;
      case 'previous_year':
        multiplier = 0.85;
        break;
      case 'target':
        multiplier = 1.1;
        break;
    }

    const previousData = currentData.map((v) => Math.round(v * multiplier));
    const growth =
      (currentData.reduce((a, b) => a + b, 0) /
        previousData.reduce((a, b) => a + b, 0) -
        1) *
      100;

    return {
      values: previousData,
      growth: growth,
    };
  }

  private updateChart() {
    if (!this.filteredData) return;

    const datasets: any[] = [
      {
        data: this.filteredData.values,
        borderColor: '#6366f1',
        backgroundColor: (ctx: any) => {
          if (!ctx.chart?.ctx) return 'transparent';
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
          g.addColorStop(0, 'rgba(99,102,241,0.25)');
          g.addColorStop(1, 'rgba(99,102,241,0)');
          return g;
        },
        fill: true,
        label: 'Sales',
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ];

    if (this.comparisonData) {
      datasets.push({
        data: this.comparisonData.values,
        borderColor: '#94a3b8',
        backgroundColor: 'transparent',
        borderDash: [5, 5] as any,
        fill: false,
        label: 'Previous Period',
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: '#94a3b8',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1,
      });
    }

    this.chartData = {
      labels: this.filteredData.labels,
      datasets: datasets,
    };
  }

  formatCurrency(value: number): string {
    if (value >= 1000) {
      return `Rs. ${(value / 1000).toFixed(1)}K`;
    }
    return `Rs. ${value}`;
  }

  getPeriodLabel(): string {
    switch (this.filterState?.dateRange?.preset) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'last7days':
        return 'Last 7 Days';
      case 'last30days':
        return 'Last 30 Days';
      case 'thisMonth':
        return 'This Month';
      case 'lastMonth':
        return 'Last Month';
      case 'thisQuarter':
        return 'This Quarter';
      case 'thisYear':
        return 'This Year';
      default:
        return 'Selected Period';
    }
  }

  getComparisonLabel(): string {
    switch (this.filterState?.comparison) {
      case 'previous_period':
        return 'Previous Period';
      case 'previous_year':
        return 'Last Year';
      case 'target':
        return 'Target';
      default:
        return '';
    }
  }

  getGranularityLabel(): string {
    if (this.filteredData?.labels?.length) {
      if (
        this.filteredData.labels[0].includes('am') ||
        this.filteredData.labels[0].includes('pm')
      ) {
        return 'Hour';
      } else if (this.filteredData.labels[0].length <= 3) {
        return 'Day';
      } else if (this.filteredData.labels[0].includes('Week')) {
        return 'Week';
      } else if (this.filteredData.labels[0].length === 3) {
        return 'Month';
      }
    }
    return 'Period';
  }
}
