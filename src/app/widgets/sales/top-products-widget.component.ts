import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-top-products-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Top Products" icon="star">
      <div class="product-list">
        <div class="product-row" *ngFor="let p of data">
          <div class="rank">#{{ p.rank }}</div>
          <div class="product-info">
            <div class="product-name">{{ p.name }}</div>
            <div class="product-cat">{{ p.category }}</div>
          </div>
          <div class="product-right">
            <div class="product-amount">Rs. {{ p.amount | number }}</div>
            <div
              class="product-change"
              [class.up]="p.change > 0"
              [class.down]="p.change < 0"
            >
              <span class="material-icons">{{
                p.change > 0 ? 'arrow_upward' : 'arrow_downward'
              }}</span>
              {{ p.change | number: '1.1-1' }}%
            </div>
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .product-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .product-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .rank {
        font-size: 13px;
        font-weight: 800;
        color: #6366f1;
        width: 24px;
        flex-shrink: 0;
      }
      .product-info {
        flex: 1;
        min-width: 0;
      }
      .product-name {
        font-size: 13px;
        font-weight: 600;
        color: #7c879b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .product-cat {
        font-size: 11px;
        color: #8892a4;
        margin-top: 2px;
      }
      .product-right {
        text-align: right;
        flex-shrink: 0;
      }
      .product-amount {
        font-size: 13px;
        font-weight: 700;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
      }
      .product-change {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 11px;
        font-weight: 600;
        gap: 2px;
        .material-icons {
          font-size: 12px;
        }
        &.up {
          color: #10b981;
        }
        &.down {
          color: #ef4444;
        }
      }
    `,
  ],
})
export class TopProductsWidgetComponent {
  @Input() data: any[] = [];
}
