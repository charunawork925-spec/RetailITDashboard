// widgets/sales/sales-trend-widget.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterStateService } from '../../services/filter-state.service';
import { FilterContext } from '../../models/filter-state.model';
import { BaseFilterableWidget } from '../base-filterable-widget';

interface TrendData {
  labels: string[];
  actualSales: number[];
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-sales-trend-widget',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="widget-shell">
      <div class="widget-header">
        <div>
          <div class="widget-title">{{ trendData.title }}</div>
          <div class="widget-sub">{{ trendData.subtitle }}</div>
        </div>
        <div class="header-actions">
          <button
            class="drill-btn"
            [class.active]="drillLevel >= 1"
            (click)="onDrillDown()"
            *ngIf="activeTopic === 'sales'"
          >
            <span class="material-icons">south</span>
            {{ drillLevel >= 1 ? trendData.subtitle : 'Drill down' }}
          </button>
        </div>
      </div>

      <div class="chart-area">
        <div class="chart-labels-y">
          <span *ngFor="let y of yLabels">{{ y }}</span>
        </div>
        <div class="chart-bars-wrap">
          <div
            class="chart-col"
            *ngFor="
              let v of trendData.actualSales;
              let i = index;
              trackBy: trackIdx
            "
            (click)="onBarClick(i)"
            [class.selected]="selectedBarIndex === i"
          >
            <div class="bar-outer">
              <div
                class="bar-inner"
                [style.height.%]="getBarPct(v)"
                [style.background]="
                  selectedBarIndex === i ? '#6366f1' : 'rgba(99,102,241,0.55)'
                "
              ></div>
            </div>
            <span class="bar-label">{{ trendData.labels[i] }}</span>
          </div>
        </div>
      </div>

      <!-- Selected bar detail -->
      <div class="bar-detail" *ngIf="selectedBarIndex >= 0">
        <span class="detail-label">{{
          trendData.labels[selectedBarIndex]
        }}</span>
        <span class="detail-val"
          >Rs. {{ formatVal(trendData.actualSales[selectedBarIndex]) }}</span
        >
        <button class="detail-filter-btn" (click)="filterBySelectedBar()">
          <span class="material-icons">filter_alt</span>
          Filter to this {{ barFilterLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .widget-shell {
        padding: 16px;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .widget-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }
      .widget-title {
        font-size: 13px;
        font-weight: 600;
        color: #1a1f2e;
      }
      .widget-sub {
        font-size: 11px;
        color: #9aa5be;
        margin-top: 2px;
      }

      .header-actions {
        display: flex;
        gap: 6px;
      }
      .drill-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        border: 1px solid rgba(99, 102, 241, 0.3);
        background: rgba(99, 102, 241, 0.06);
        color: #6366f1;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
      }
      .drill-btn:hover {
        background: rgba(99, 102, 241, 0.12);
      }
      .drill-btn.active {
        background: #6366f1;
        color: white;
        border-color: #6366f1;
      }
      .drill-btn .material-icons {
        font-size: 13px;
      }

      .chart-area {
        flex: 1;
        display: flex;
        gap: 8px;
        min-height: 0;
      }

      .chart-labels-y {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: 10px;
        color: #b0bcd4;
        padding-bottom: 20px;
      }

      .chart-bars-wrap {
        flex: 1;
        display: flex;
        align-items: flex-end;
        gap: 4px;
        min-width: 0;
      }

      .chart-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        min-width: 0;
      }
      .chart-col:hover .bar-inner {
        background: #6366f1 !important;
      }

      .bar-outer {
        width: 100%;
        height: 180px;
        display: flex;
        align-items: flex-end;
        background: #f8f9fd;
        border-radius: 4px 4px 0 0;
        overflow: hidden;
      }
      .bar-inner {
        width: 100%;
        border-radius: 4px 4px 0 0;
        transition:
          height 0.4s ease,
          background 0.15s;
      }

      .bar-label {
        font-size: 10px;
        color: #9aa5be;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }
      .chart-col.selected .bar-label {
        color: #6366f1;
        font-weight: 600;
      }

      .bar-detail {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        padding: 8px 12px;
        background: #eef2ff;
        border-radius: 8px;
        border: 1px solid #c7d2fe;
      }
      .detail-label {
        font-size: 12px;
        color: #6b7a99;
      }
      .detail-val {
        font-size: 14px;
        font-weight: 600;
        color: #1a1f2e;
        flex: 1;
      }
      .detail-filter-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        color: #6366f1;
        background: white;
        border: 1px solid #c7d2fe;
        border-radius: 20px;
        padding: 3px 10px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
      }
      .detail-filter-btn:hover {
        background: #eef2ff;
      }
      .detail-filter-btn .material-icons {
        font-size: 13px;
      }
    `,
  ],
})
export class SalesTrendWidgetComponent
  extends BaseFilterableWidget
  implements OnInit, OnDestroy
{
  // Base data sets
  private readonly BASE_DATA: Record<string, TrendData> = {
    hourly: {
      title: 'Hourly Sales',
      subtitle: 'Today by hour',
      labels: [
        '8am',
        '9am',
        '10am',
        '11am',
        '12pm',
        '1pm',
        '2pm',
        '3pm',
        '4pm',
        '5pm',
        '6pm',
        '7pm',
      ],
      actualSales: [90, 140, 220, 310, 380, 420, 460, 510, 540, 490, 380, 210],
    },
    daily: {
      title: 'Daily Sales',
      subtitle: 'This week by day',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      actualSales: [18500, 20200, 19800, 22400, 25600, 28900, 24700],
    },
    weekly: {
      title: 'Weekly Sales',
      subtitle: 'This month by week',
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      actualSales: [135000, 142000, 151000, 161340],
    },
    monthly: {
      title: 'Monthly Sales',
      subtitle: 'This year by month',
      labels: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      actualSales: [
        450000, 495000, 520000, 510000, 580000, 620000, 590000, 610000, 630000,
        680000, 720000, 699500,
      ],
    },
  };

  trendData: TrendData = {
    ...this.BASE_DATA['daily'], // ← set a default instead of empty
    title: 'Sales Trend',
    subtitle: 'This week by day',
    // labels: [],
    // actualSales: [],
    // title: 'Sales Trend',
    // subtitle: 'Loading...',
  };
  yLabels: string[] = [];
  selectedBarIndex = -1;
  barFilterLabel = 'period';

  constructor(filterState: FilterStateService, cdr: ChangeDetectorRef) {
    super(filterState, cdr);
  }

  ngOnInit() {
    // Set default data immediately before filter subscription fires
    this.trendData = { ...this.BASE_DATA['daily'] };
    this.updateYLabels();
    this.initFilter();
  }
  override ngOnDestroy() {
    this.destroyFilter();
  }

  protected onFilterChange(ctx: FilterContext): void {
    this.selectedBarIndex = -1;

    // Determine granularity from drill level + period filter
    const granularity = this.resolveGranularity(ctx);
    const base = this.BASE_DATA[granularity];
    const multiplier = this.filterState.computeEffectiveMultiplier(ctx.filters);

    this.trendData = {
      ...base,
      actualSales: base.actualSales.map((v) => Math.round(v * multiplier)),
    };

    this.barFilterLabel = this.getBarFilterLabel(granularity);
    this.updateYLabels();
  }

  private resolveGranularity(ctx: FilterContext): string {
    // Drill level 2 → hourly
    if (ctx.drillLevel >= 2) return 'hourly';

    const period = ctx.filters['period']?.[0] ?? '';
    if (period === 'Today') return 'hourly';
    if (period === 'This Week') return 'daily';
    if (period === 'This Year') return 'monthly';

    // Default based on drill
    if (ctx.drillLevel >= 1) return 'daily';
    return 'daily';
  }

  private getBarFilterLabel(granularity: string): string {
    return (
      { hourly: 'hour', daily: 'day', weekly: 'week', monthly: 'month' }[
        granularity
      ] ?? 'period'
    );
  }

  private updateYLabels(): void {
    const max = Math.max(...this.trendData.actualSales, 1);
    this.yLabels = [
      this.formatVal(max),
      this.formatVal(max * 0.66),
      this.formatVal(max * 0.33),
      '0',
    ];
  }

  getBarPct(val: number): number {
    const max = Math.max(...this.trendData.actualSales, 1);
    return Math.round((val / max) * 100);
  }

  formatVal(val: number): string {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
    if (val >= 1_000) return (val / 1_000).toFixed(0) + 'k';
    return val.toString();
  }

  onBarClick(i: number) {
    this.selectedBarIndex = this.selectedBarIndex === i ? -1 : i;
    this.cdr.markForCheck();
  }

  filterBySelectedBar() {
    if (this.selectedBarIndex < 0) return;
    const label = this.trendData.labels[this.selectedBarIndex];
    // Map label to period filter
    const periodMap: Record<string, string> = {
      Mon: 'This Week',
      Tue: 'This Week',
      Wed: 'This Week',
      Thu: 'This Week',
      Fri: 'This Week',
      Sat: 'This Week',
      Sun: 'This Week',
    };
    this.filterState.toggleFilter('period', periodMap[label] ?? label, true);
    this.selectedBarIndex = -1;
  }

  onDrillDown() {
    if (this.drillLevel < 2) {
      const ctx = this.filterContext!;
      const nextLabels = ['By Category', 'By Product'];
      const nextContexts = ['category', 'product'];
      this.filterState.drillDown(
        nextLabels[ctx.drillLevel],
        nextContexts[ctx.drillLevel],
      );
    }
  }

  trackIdx(i: number) {
    return i;
  }
}
