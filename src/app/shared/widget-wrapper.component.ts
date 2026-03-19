// shared/widget-wrapper.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-widget-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="widget-wrapper"
      [class.filtered]="showFilters && hasActiveFilters"
    >
      <div class="widget-header">
        <div class="title-area">
          <span class="material-icons widget-icon">{{ icon }}</span>
          <h3 class="widget-title">{{ title }}</h3>
        </div>
        <div class="widget-actions">
          <div
            class="filter-badge"
            *ngIf="showFilters && hasActiveFilters"
            [title]="activeFiltersTooltip"
          >
            <span class="material-icons">filter_alt</span>
            <span class="filter-count">{{ activeFilterCount }}</span>
          </div>
          <ng-content select="[widget-actions]"></ng-content>
        </div>
      </div>
      <div class="widget-content">
        <ng-content></ng-content>
      </div>
      <div class="filter-indicator" *ngIf="showFilters && hasActiveFilters">
        <div class="filter-chips">
          <span class="filter-chip" *ngFor="let filter of activeFilters">
            {{ filter.label }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .widget-wrapper {
        height: 100%;
        background: #ffffff;
        border-radius: 16px;
        border: 1px solid #e2e6f0;
        display: flex;
        flex-direction: column;
        transition: all 0.2s;
        overflow: hidden;
      }

      .widget-wrapper.filtered {
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
      }

      .widget-header {
        padding: 16px 16px 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #f0f2f8;
      }

      .title-area {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .widget-icon {
        font-size: 18px;
        color: #6b7a99;
      }

      .widget-title {
        font-size: 14px;
        font-weight: 600;
        color: #1a1f2e;
        margin: 0;
      }

      .widget-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .filter-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        background: #6366f1;
        color: white;
        padding: 2px 8px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        cursor: help;
      }

      .filter-badge .material-icons {
        font-size: 14px;
      }

      .filter-count {
        line-height: 1;
      }

      .widget-content {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
      }

      .filter-indicator {
        padding: 8px 16px 12px;
        border-top: 1px solid #f0f2f8;
        background: #f8f9fd;
      }

      .filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .filter-chip {
        background: #6366f1;
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }
    `,
  ],
})
export class WidgetWrapperComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() showFilters: boolean = false;
  @Input() hasActiveFilters: boolean = false;
  @Input() activeFilterCount: number = 0;
  @Input() activeFiltersTooltip: string = '';
  @Input() activeFilters: { type: string; label: string }[] = [];
}
