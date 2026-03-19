import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-store-performance-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Store Performance" icon="business">
      <div class="store-table">
        <div class="table-header">
          <span>Store</span>
          <span>Revenue</span>
          <span>Avg Bill</span>
          <span>Txn</span>
          <span>Perf.</span>
        </div>
        <div class="table-row" *ngFor="let s of data">
          <span class="store-name">{{ s.storeName }}</span>
          <span class="store-rev"
            >Rs. {{ s.revenue / 1000 | number: '1.0-0' }}K</span
          >
          <span class="store-avg"
            >Rs. {{ s.avgBillValue / 1000 | number: '1.1-1' }}K</span
          >
          <span class="store-txn">{{ s.transactions }}</span>
          <span
            class="store-perf"
            [class.up]="s.performance > 0"
            [class.down]="s.performance < 0"
          >
            <span class="material-icons">{{
              s.performance > 0 ? 'arrow_upward' : 'arrow_downward'
            }}</span>
            {{ s.performance > 0 ? '+' : '' }}{{ s.performance }}%
          </span>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .store-table {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .table-header {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 0.5fr 0.8fr;
        padding: 6px 10px;
        font-size: 11px;
        font-weight: 600;
        color: #4f5b6e;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .table-row {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 0.5fr 0.8fr;
        padding: 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        align-items: center;
      }
      .store-name {
        font-size: 13px;
        font-weight: 600;
        color: #7c879b;
      }
      .store-rev,
      .store-avg {
        font-size: 13px;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
      }
      .store-txn {
        font-size: 13px;
        color: #8892a4;
      }
      .store-perf {
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
          font-size: 12px;
        }
      }
    `,
  ],
})
export class StorePerformanceWidgetComponent {
  @Input() data: any[] = [];
}
