import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-profit-overview-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Profit Overview" icon="account_balance">
      <div class="profit-grid" *ngIf="data">
        <div class="profit-metric" *ngFor="let m of metrics">
          <div class="pm-icon" [style.background]="m.bg">
            <span class="material-icons">{{ m.icon }}</span>
          </div>
          <div class="pm-info">
            <div
              class="pm-value"
              [class.up]="m.change > 0"
              [class.down]="m.change < 0"
            >
              {{ m.value }}
            </div>
            <div class="pm-label">{{ m.label }}</div>
          </div>
          <div
            class="pm-change"
            [class.up]="m.change > 0"
            [class.down]="m.change < 0"
            *ngIf="m.change !== 0"
          >
            <span class="material-icons">{{
              m.change > 0 ? 'arrow_upward' : 'arrow_downward'
            }}</span>
            {{ m.change > 0 ? '+' : '' }}{{ m.change }}%
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .profit-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .profit-metric {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
      }
      .pm-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        .material-icons {
          font-size: 18px;
          color: white;
        }
      }
      .pm-info {
        flex: 1;
      }
      .pm-value {
        font-size: 18px;
        font-weight: 800;
        font-family: 'JetBrains Mono', monospace;
        &.up {
          color: #10b981;
        }
        &.down {
          color: #ef4444;
        }
        color: #7c879b;
      }
      .pm-label {
        font-size: 12px;
        color: #8892a4;
        margin-top: 2px;
      }
      .pm-change {
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 2px;
        &.up {
          color: #10b981;
        }
        &.down {
          color: #ef4444;
        }
        .material-icons {
          font-size: 14px;
        }
      }
    `,
  ],
})
export class ProfitOverviewWidgetComponent {
  @Input() set data(val: any) {
    console.log('ProfitOverviewWidgetComponent received data:', val);
    console.log('Data structure check:', {
      hasRevenueGrowth: val?.revenueGrowth,
      hasAvgProfitMargin: val?.avgProfitMargin,
      hasSalesRepTransaction: val?.salesRepTransaction,
      fullData: val,
    });
    console.log('ProfitOverviewWidgetComponent received data:', val);
    if (!val) return;
    this.metrics = [
      {
        label: val.revenueGrowth.label,
        value: val.revenueGrowth.value,
        change: val.revenueGrowth.change,
        icon: 'trending_up',
        bg: 'rgba(99,102,241,0.3)',
      },
      {
        label: val.avgProfitMargin.label,
        value: val.avgProfitMargin.value,
        change: val.avgProfitMargin.change,
        icon: 'percent',
        bg: 'rgba(16,185,129,0.3)',
      },
      {
        label: val.salesRepTransaction.label,
        value: val.salesRepTransaction.value,
        change: val.salesRepTransaction.change,
        icon: 'receipt',
        bg: 'rgba(139,92,246,0.3)',
      },
    ];
  }
  metrics: any[] = [];
}
