import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-top-customers-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Top Customers" icon="person_pin">
      <div class="customer-list">
        <div class="customer-row" *ngFor="let c of data; let i = index">
          <div class="rank-badge" [class]="'r' + (i + 1)">{{ i + 1 }}</div>
          <div class="avatar-badge">{{ getInitials(c.name) }}</div>
          <div class="customer-info">
            <div class="customer-name">{{ c.name }}</div>
            <div class="customer-type" [class]="getTypeClass(c.type)">
              {{ c.type }}
            </div>
          </div>
          <div class="customer-right">
            <div class="customer-amount">Rs. {{ c.amount | number }}</div>
            <div class="customer-orders">{{ c.orders }} orders</div>
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .customer-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .customer-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .rank-badge {
        width: 20px;
        text-align: center;
        font-size: 12px;
        font-weight: 800;
        flex-shrink: 0;
        &.r1 {
          color: #f59e0b;
        }
        &.r2 {
          color: #9ca3af;
        }
        &.r3 {
          color: #cd7c2c;
        }
        &.r4,
        &.r5 {
          color: #4f5b6e;
        }
      }
      .avatar-badge {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        flex-shrink: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        color: white;
      }
      .customer-info {
        flex: 1;
        min-width: 0;
      }
      .customer-name {
        font-size: 14px;
        font-weight: 600;
        color: #7c879b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .customer-type {
        font-size: 11px;
        margin-top: 3px;
        font-weight: 600;
        &.premium {
          color: #f59e0b;
        }
        &.regular {
          color: #3b82f6;
        }
        &.new {
          color: #10b981;
        }
      }
      .customer-right {
        text-align: right;
        flex-shrink: 0;
      }
      .customer-amount {
        font-size: 14px;
        font-weight: 700;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
      }
      .customer-orders {
        font-size: 11px;
        color: #8892a4;
        margin-top: 3px;
      }
    `,
  ],
})
export class TopCustomersWidgetComponent {
  @Input() data: any[] = [];
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2);
  }
  getTypeClass(type: string): string {
    if (type.includes('Premium')) return 'premium';
    if (type.includes('New')) return 'new';
    return 'regular';
  }
}
