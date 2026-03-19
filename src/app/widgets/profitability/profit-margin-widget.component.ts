import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-profit-margin-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Profit Margin" icon="percent">
      <div class="margin-display" *ngIf="data">
        <div class="gauge-wrap">
          <svg viewBox="0 0 120 80" class="gauge-svg">
            <path
              d="M 15 70 A 50 50 0 0 1 105 70"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              stroke-width="8"
              stroke-linecap="round"
            />
            <path
              d="M 15 70 A 50 50 0 0 1 105 70"
              fill="none"
              stroke="url(#grad)"
              stroke-width="8"
              stroke-linecap="round"
              [attr.stroke-dasharray]="dashValue"
              stroke-dashoffset="0"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#6366f1" />
                <stop offset="100%" style="stop-color:#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div class="gauge-value">{{ data.avgProfitMargin.value }}</div>
          <div class="gauge-label">Profit Margin</div>
        </div>
        <div class="margin-stats">
          <div class="mstat">
            <div class="mstat-val up">{{ data.revenueGrowth.value }}</div>
            <div class="mstat-label">Revenue Growth</div>
          </div>
          <div class="mstat">
            <div
              class="mstat-val"
              [class.down]="data.salesRepTransaction.change < 0"
            >
              {{ data.salesRepTransaction.value }}
            </div>
            <div class="mstat-label">Sales/Rep Txn</div>
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .margin-display {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .gauge-wrap {
        position: relative;
        text-align: center;
      }
      .gauge-svg {
        width: 120px;
        height: 80px;
      }
      .gauge-value {
        font-size: 22px;
        font-weight: 800;
        color: #6366f1;
        margin-top: -16px;
        font-family: 'JetBrains Mono', monospace;
      }
      .gauge-label {
        font-size: 11px;
        color: #8892a4;
        margin-top: 4px;
      }
      .margin-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .mstat {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        padding: 10px;
        text-align: center;
      }
      .mstat-val {
        font-size: 16px;
        font-weight: 800;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
        &.up {
          color: #10b981;
        }
        &.down {
          color: #ef4444;
        }
      }
      .mstat-label {
        font-size: 10px;
        color: #8892a4;
        margin-top: 4px;
      }
    `,
  ],
})
export class ProfitMarginWidgetComponent {
  @Input() data: any;
  get dashValue(): string {
    const pct = 34.2 / 100;
    const circumference = Math.PI * 50;
    return `${circumference * pct} ${circumference}`;
  }
}
