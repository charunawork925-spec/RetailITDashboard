import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-top-brands-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Top Brands" icon="verified">
      <div class="brand-list">
        <div class="brand-row" *ngFor="let b of data; let i = index">
          <div class="brand-rank" [class]="'rank-' + (i + 1)">
            #{{ b.rank }}
          </div>
          <div class="brand-info">
            <div class="brand-name">{{ b.name }}</div>
            <div class="brand-type">{{ b.type }}</div>
          </div>
          <div class="brand-amount">Rs. {{ b.amount | number }}</div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .brand-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .brand-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
      }
      .brand-rank {
        font-size: 12px;
        font-weight: 800;
        width: 24px;
        flex-shrink: 0;
        &.rank-1 {
          color: #f59e0b;
        }
        &.rank-2 {
          color: #9ca3af;
        }
        &.rank-3 {
          color: #cd7c2c;
        }
        &.rank-4,
        &.rank-5 {
          color: #6366f1;
        }
      }
      .brand-info {
        flex: 1;
      }
      .brand-name {
        font-size: 13px;
        font-weight: 600;
        color: #7c879b;
      }
      .brand-type {
        font-size: 11px;
        color: #8892a4;
      }
      .brand-amount {
        font-size: 13px;
        font-weight: 700;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
      }
    `,
  ],
})
export class TopBrandsWidgetComponent {
  @Input() data: any[] = [];
}
