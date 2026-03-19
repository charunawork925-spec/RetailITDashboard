// components/widgets/list-widget/list-widget.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-list-widget',
  standalone: true,
  imports: [CommonModule,MatIconModule],
  template: `
    <div class="list-widget">
      <div *ngIf="!listData || listData.length === 0" class="no-data">
        <mat-icon>list</mat-icon>
        <p>No list data available</p>
      </div>
      
      <div *ngIf="listData && listData.length > 0" class="list-container">
        <div *ngFor="let item of listData; trackBy: trackByItem" class="list-item">
          <div class="item-icon" [style.background-color]="getItemColor(item)">
            <mat-icon>{{ getItemIcon(item) }}</mat-icon>
          </div>
          <div class="item-content">
            <div class="item-label">{{ item.label || item.name || 'Item' }}</div>
            <div class="item-value">{{ item.value || item.amount || '' }}</div>
            <div *ngIf="item.status" class="item-status" [class]="'status-' + item.status">
              {{ item.status }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-widget {
      height: 100%;
      overflow: auto;
    }
    .list-container {
      padding: 8px;
    }
    .list-item {
      display: flex;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      transition: all 0.2s;
    }
    .list-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }
    .item-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      color: white;
    }
    .item-content {
      flex: 1;
    }
    .item-label {
      font-weight: 500;
      margin-bottom: 4px;
    }
    .item-value {
      color: #666;
      font-size: 0.9rem;
    }
    .item-status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      margin-top: 4px;
    }
    .status-critical {
      background-color: #fee2e2;
      color: #dc2626;
    }
    .status-warning {
      background-color: #fef3c7;
      color: #d97706;
    }
    .status-low {
      background-color: #dbeafe;
      color: #2563eb;
    }
    .status-ok {
      background-color: #d1fae5;
      color: #059669;
    }
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
    }
    .no-data mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }
  `]
})
export class ListWidgetComponent implements OnInit {
  @Input() widget: any = {};
  @Input() data: any[] = [];
  
  public listData: any[] = [];

  ngOnInit(): void {
    this.listData = this.data || [];
  }

  getItemColor(item: any): string {
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
    const index = Math.abs(this.hashCode(item.label || item.name || 'default')) % colors.length;
    return colors[index];
  }

  getItemIcon(item: any): string {
    const icons = ['info', 'warning', 'check_circle', 'error', 'star', 'trending_up', 'trending_down'];
    const index = Math.abs(this.hashCode(item.label || item.name || 'default')) % icons.length;
    return icons[index];
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  trackByItem(index: number, item: any): any {
    return item.id || item.label || index;
  }
}