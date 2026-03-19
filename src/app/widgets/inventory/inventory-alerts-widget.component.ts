import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-inventory-alerts-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Inventory Alerts" icon="warning">
      <div class="summary-row">
        <div class="sum-pill critical">
          <span class="material-icons">error</span> {{ criticalCount }} Critical
        </div>
        <div class="sum-pill warning">
          <span class="material-icons">warning</span> {{ warningCount }} Warning
        </div>
        <div class="sum-pill low">
          <span class="material-icons">info</span> {{ lowCount }} Low
        </div>
      </div>
      <div class="alerts-list">
        <div class="alert-item" *ngFor="let item of data" [class]="item.status">
          <div class="alert-icon">
            <span class="material-icons">{{ getIcon(item.status) }}</span>
          </div>
          <div class="alert-info">
            <div class="alert-name">{{ item.productName }}</div>
            <div class="alert-stock">
              {{ item.currentStock }} {{ item.unit }}
            </div>
          </div>
          <div class="alert-bar-wrap">
            <div class="alert-pct">{{ item.percentage }}%</div>
            <div class="alert-bar">
              <div
                class="alert-fill"
                [class]="item.status"
                [style.width.%]="item.percentage"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .summary-row {
        display: flex;
        gap: 8px;
        margin-bottom: 14px;
        flex-wrap: wrap;
      }
      .sum-pill {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        .material-icons {
          font-size: 14px;
        }
        &.critical {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        &.warning {
          background: rgba(245, 158, 11, 0.12);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        &.low {
          background: rgba(59, 130, 246, 0.12);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
      }
      .alerts-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .alert-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 10px;
        border-left: 3px solid;
        &.critical {
          background: rgba(239, 68, 68, 0.07);
          border-color: #ef4444;
        }
        &.warning {
          background: rgba(245, 158, 11, 0.07);
          border-color: #f59e0b;
        }
        &.low {
          background: rgba(59, 130, 246, 0.07);
          border-color: #3b82f6;
        }
      }
      .alert-icon .material-icons {
        font-size: 22px;
      }
      .critical .alert-icon .material-icons {
        color: #ef4444;
      }
      .warning .alert-icon .material-icons {
        color: #f59e0b;
      }
      .low .alert-icon .material-icons {
        color: #3b82f6;
      }
      .alert-info {
        flex: 1;
        min-width: 0;
      }
      .alert-name {
        font-size: 13px;
        font-weight: 600;
        color: #7c879b;
      }
      .alert-stock {
        font-size: 12px;
        color: #8892a4;
        margin-top: 3px;
      }
      .alert-bar-wrap {
        text-align: right;
        min-width: 90px;
      }
      .alert-pct {
        font-size: 12px;
        font-weight: 700;
        color: #8892a4;
        margin-bottom: 5px;
      }
      .alert-bar {
        height: 5px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 3px;
        overflow: hidden;
      }
      .alert-fill {
        height: 100%;
        border-radius: 3px;
        &.critical {
          background: #ef4444;
        }
        &.warning {
          background: #f59e0b;
        }
        &.low {
          background: #3b82f6;
        }
      }
    `,
  ],
})
export class InventoryAlertsWidgetComponent {
  @Input() data: any[] = [];
  get criticalCount() {
    return this.data.filter((d) => d.status === 'critical').length;
  }
  get warningCount() {
    return this.data.filter((d) => d.status === 'warning').length;
  }
  get lowCount() {
    return this.data.filter((d) => d.status === 'low').length;
  }
  getIcon(s: string) {
    return s === 'critical' ? 'error' : s === 'warning' ? 'warning' : 'info';
  }
}
