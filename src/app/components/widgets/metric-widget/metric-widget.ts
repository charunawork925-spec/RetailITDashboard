// metric-widget.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-metric-widget',
  standalone: true,
  imports:[CommonModule,FormsModule],
  template: `
    <div class="metric-widget" [ngClass]="widget.config?.size || 'medium'">
      <div class="metric-header">
        <h4>{{ widget.title }}</h4>
        <div class="widget-actions">
          <button (click)="refresh()">↻</button>
          <button (click)="configure()">⚙️</button>
          <button (click)="remove()">×</button>
        </div>
      </div>
      <div class="metric-content">
        <div class="metric-value" [ngClass]="getChangeClass(data.change)">
          {{ data.value }}
          <span class="metric-change" *ngIf="data.change !== undefined">
            {{ data.change > 0 ? '+' : '' }}{{ data.change }}%
          </span>
        </div>
        <div class="metric-label">{{ data.label }}</div>
      </div>
    </div>
  `,
  styles: [`
    .metric-widget {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      height: 100%;
    }
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .metric-change.positive { color: #10B981; }
    .metric-change.negative { color: #EF4444; }
  `]
})
export class MetricWidgetComponent {
  @Input() widget: any;
  @Input() data: any;

  getChangeClass(change: number): string {
    return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  }

  refresh(): void {
    // Implement refresh logic
  }

  configure(): void {
    // Open configuration modal
  }

  remove(): void {
    // Emit remove event
  }
}