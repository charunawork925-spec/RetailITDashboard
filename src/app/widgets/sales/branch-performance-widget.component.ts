import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-branch-performance-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Branch Performance" icon="store">
      <div class="branch-grid">
        <div class="branch-card" *ngFor="let b of data" [class]="b.status">
          <div class="branch-header">
            <span class="branch-name">{{ b.branchName }}</span>
            <span class="status-dot" [class]="b.status"></span>
          </div>
          <div class="branch-revenue">Rs. {{ b.revenue | number }}</div>
          <div class="branch-stats">
            <span>{{ b.transactions }} txn</span>
            <span>{{ b.customers }} cust</span>
          </div>
          <div class="perf-bar">
            <div
              class="perf-fill"
              [class]="b.status"
              [style.width.%]="getPerf(b)"
            ></div>
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .branch-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .branch-card {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .branch-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .branch-name {
        font-size: 13px;
        font-weight: 700;
        color: #454f61;
      }
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        &.excellent {
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }
        &.average {
          background: #f59e0b;
        }
        &.poor {
          background: #ef4444;
        }
      }
      .branch-revenue {
        font-size: 18px;
        font-weight: 800;
        color: #7c879b;
        margin-bottom: 6px;
        font-family: 'JetBrains Mono', monospace;
      }
      .branch-stats {
        display: flex;
        gap: 10px;
        font-size: 11px;
        color: #8892a4;
        margin-bottom: 8px;
      }
      .perf-bar {
        height: 3px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 2px;
        overflow: hidden;
      }
      .perf-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 1s ease;
        &.excellent {
          background: #10b981;
        }
        &.average {
          background: #f59e0b;
        }
        &.poor {
          background: #ef4444;
        }
      }
    `,
  ],
})
export class BranchPerformanceWidgetComponent {
  @Input() data: any[] = [];
  getPerf(b: any): number {
    return Math.min(100, Math.max(0, (b.performance / 200) * 100));
  }
}
