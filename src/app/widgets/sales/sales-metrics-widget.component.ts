import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-sales-metrics-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Sales Metrics" icon="trending_up">
      <div class="metrics-grid">
        <div class="metric-card" *ngFor="let m of metricsArray">
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
export class SalesMetricsWidgetComponent {
  @Input() set data(val: any) {
    if (val) this.metricsArray = Object.values(val);
  }
  metricsArray: any[] = [];
}
