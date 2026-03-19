// components/widgets/table-widget/table-widget.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-table-widget',
  standalone: true,
  imports: [CommonModule,MatIconModule],
  template: `
    <div class="table-widget">
      <div *ngIf="!data || data.length === 0" class="no-data">
        <mat-icon>table_chart</mat-icon>
        <p>No data available</p>
      </div>
      
      <table *ngIf="data && data.length > 0" class="widget-table">
        <thead>
          <tr>
            <th *ngFor="let column of getColumns()">{{ getColumnHeader(column) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data; trackBy: trackByRow">
            <td *ngFor="let column of getColumns()">
              {{ formatCellValue(row[column], column) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-widget {
      height: 100%;
      overflow: auto;
    }
    .widget-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    .widget-table th {
      background-color: #f5f5f5;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e0e0e0;
      position: sticky;
      top: 0;
    }
    .widget-table td {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    .widget-table tr:hover {
      background-color: #f9f9f9;
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
export class TableWidgetComponent implements OnInit {
  @Input() widget: any = {};
  @Input() data: any[] = [];

  ngOnInit(): void {
    // Initialize with empty array if no data provided
    if (!this.data) {
      this.data = [];
    }
  }

  getColumns(): string[] {
    if (this.data && this.data.length > 0) {
      return Object.keys(this.data[0]);
    }
    return [];
  }

  getColumnHeader(column: string): string {
    // Convert camelCase or snake_case to readable header
    return column
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase());
  }

  formatCellValue(value: any, column: string): string {
    if (value === null || value === undefined) return '-';
    
    // Format numbers with commas
    if (typeof value === 'number') {
      if (column.toLowerCase().includes('percent') || column.toLowerCase().includes('rate')) {
        return value.toFixed(1) + '%';
      }
      if (column.toLowerCase().includes('amount') || column.toLowerCase().includes('price') || 
          column.toLowerCase().includes('revenue') || column.toLowerCase().includes('profit')) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      }
      return new Intl.NumberFormat().format(value);
    }
    
    // Format dates
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    return String(value);
  }

  trackByRow(index: number, row: any): any {
    return row.id || index;
  }
}