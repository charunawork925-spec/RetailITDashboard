import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-wastage-summary-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Wastage Summary" icon="delete_sweep">
      <div class="wastage-layout" *ngIf="data">
        <div class="main-stat">
          <div class="waste-value">{{ data.summary.totalWastage }}</div>
          <div class="waste-label">Total Wastage This Month</div>
          <div class="waste-trend down">
            <span class="material-icons">trending_down</span>
            {{ data.summary.trend }}% vs last month
          </div>
        </div>
        <div class="waste-items">
          <div class="waste-item" *ngFor="let w of data.topWastedItems">
            <div class="waste-item-info">
              <span class="waste-item-name">{{ w.name }}</span>
              <span class="waste-reason" [class]="w.reason.toLowerCase()">{{
                w.reason
              }}</span>
            </div>
            <div class="waste-item-right">
              <div class="waste-item-amount">Rs. {{ w.amount }}</div>
              <div class="waste-units">{{ w.units }} units</div>
            </div>
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .wastage-layout {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .main-stat {
        text-align: center;
        padding: 14px;
        background: rgba(239, 68, 68, 0.08);
        border-radius: 12px;
        border: 1px solid rgba(239, 68, 68, 0.15);
      }
      .waste-value {
        font-size: 28px;
        font-weight: 800;
        color: #ef4444;
        font-family: 'JetBrains Mono', monospace;
      }
      .waste-label {
        font-size: 12px;
        color: #8892a4;
        margin-top: 4px;
      }
      .waste-trend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;
        margin-top: 6px;
        &.down {
          color: #10b981;
        }
        .material-icons {
          font-size: 16px;
        }
      }
      .waste-items {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .waste-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
      }
      .waste-item-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .waste-item-name {
        font-size: 13px;
        font-weight: 600;
        color: #8892a4;
      }
      .waste-reason {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        width: fit-content;
        &.expired {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        &.damaged {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        &.overripe {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }
      }
      .waste-item-right {
        text-align: right;
      }
      .waste-item-amount {
        font-size: 13px;
        font-weight: 700;
        color: #ef4444;
        font-family: 'JetBrains Mono', monospace;
      }
      .waste-units {
        font-size: 11px;
        color: #8892a4;
        margin-top: 2px;
      }
    `,
  ],
})
export class WastageSummaryWidgetComponent implements OnInit {
  data: any;
  constructor(private analytics: AnalyticsService) {}
  ngOnInit() {
    this.analytics.getWastageData().subscribe((d) => (this.data = d));
  }
}
