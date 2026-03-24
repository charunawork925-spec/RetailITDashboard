import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';
import { FilterService } from '../../services/filter.service';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';
import { Subject, takeUntil } from 'rxjs';
import { TimePeriod } from '../../models/analytics';

@Component({
  selector: 'app-wastage-by-category-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Wastage by Category" icon="donut_large">
      <div class="cat-layout">
        <div class="donut-area" style="height:160px;">
          <canvas
            baseChart
            [data]="chartData"
            [options]="chartOptions"
            type="doughnut"
          ></canvas>
        </div>
        <div class="cat-legend">
          <div class="cat-leg-item" *ngFor="let c of categories">
            <span class="cat-dot" [style.background]="c.color"></span>
            <span class="cat-name">{{ c.category }}</span>
            <span class="cat-amt">Rs. {{ formatAmount(c.amount) }}</span>
            <span class="cat-pct">{{ c.percentage }}%</span>
          </div>
        </div>
        <div class="period-badge" *ngIf="currentPeriod">
          <span class="material-icons">schedule</span>
          <span>{{ getPeriodLabel() }}</span>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .cat-layout {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .cat-legend {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cat-leg-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        transition: all 0.2s;
      }
      .cat-leg-item:hover {
        background: rgba(99, 102, 241, 0.08);
        transform: translateX(4px);
      }
      .cat-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .cat-name {
        font-size: 12px;
        color: #8892a4;
        flex: 1;
      }
      .cat-amt {
        font-size: 12px;
        font-weight: 700;
        color: #8892a4;
        font-family: 'JetBrains Mono', monospace;
      }
      .cat-pct {
        font-size: 11px;
        color: #4f5b6e;
        width: 32px;
        text-align: right;
      }
      .period-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        background: rgba(99, 102, 241, 0.08);
        border-radius: 6px;
        font-size: 11px;
        color: #6366f1;
        margin-top: 8px;
        border: 1px solid rgba(99, 102, 241, 0.2);
      }
      .period-badge .material-icons {
        font-size: 14px;
      }
      .loading-overlay {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .loader-ring-small {
        width: 24px;
        height: 24px;
        border: 2px solid #e2e6f0;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class WastageByCategoryWidgetComponent implements OnInit, OnDestroy {
  categories: any[] = [];
  currentPeriod: TimePeriod = 'today';
  isLoading = false;
  private destroy$ = new Subject<void>();

  chartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [],
  };

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c2235',
        titleColor: '#f0f2f8',
        bodyColor: '#8892a4',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const category = this.categories.find((c) => c.category === label);
            if (category) {
              return `${label}: ${value}% (Rs. ${this.formatAmount(category.amount)})`;
            }
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  constructor(
    private analytics: AnalyticsService,
    private filterService: FilterService,
  ) {}

  ngOnInit() {
    // Initial load
    this.loadWastageData('today');

    // Subscribe to date range changes
    this.filterService.dateRangeChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((preset) => {
        const period = this.convertPresetToPeriod(preset);
        if (period) {
          console.log(
            '📊 Wastage by Category widget updating for period:',
            period,
          );
          this.loadWastageData(period);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private convertPresetToPeriod(preset: string): TimePeriod | null {
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
        return null;
    }
  }

  private loadWastageData(period: TimePeriod) {
    this.isLoading = true;
    this.currentPeriod = period;

    this.analytics
      .getWastageData(period)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log(
            `✅ Wastage by Category data loaded for ${period}:`,
            data.byCategory,
          );
          this.categories = data.byCategory;
          this.updateChartData();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading wastage data:', error);
          this.isLoading = false;
        },
      });
  }

  private updateChartData() {
    this.chartData = {
      labels: this.categories.map((c: any) => c.category),
      datasets: [
        {
          data: this.categories.map((c: any) => c.percentage),
          backgroundColor: this.categories.map((c: any) => c.color),
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    };
  }

  formatAmount(amount: number): string {
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'k';
    }
    return amount.toString();
  }

  getPeriodLabel(): string {
    switch (this.currentPeriod) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return '';
    }
  }
}
