// components/filter-panel/filter-panel.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FilterStateService } from '../../services/filter-state.service';
import {
  FilterDefinition,
  ActiveFilterChip,
} from '../../models/filter-state.model';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="filter-panel" [class.collapsed]="collapsed">
      <!-- Toggle button -->
      <button
        class="fp-toggle"
        (click)="collapsed = !collapsed"
        [title]="collapsed ? 'Expand filters' : 'Collapse filters'"
      >
        <span class="material-icons">{{
          collapsed ? 'filter_list' : 'chevron_left'
        }}</span>
      </button>

      <ng-container *ngIf="!collapsed">
        <!-- Header -->
        <div class="fp-header">
          <div class="fp-header-left">
            <span class="material-icons fp-icon">filter_list</span>
            <span class="fp-title">Filters</span>
            <span class="fp-badge" *ngIf="totalActiveFilters > 0">{{
              totalActiveFilters
            }}</span>
          </div>
          <button
            class="fp-clear"
            (click)="clearAll()"
            *ngIf="totalActiveFilters > 0"
          >
            Clear all
          </button>
        </div>

        <!-- Active filter chips -->
        <div class="fp-chips" *ngIf="activeChips.length > 0">
          <span
            class="fp-chip"
            *ngFor="let chip of activeChips; trackBy: trackChip"
            (click)="removeChip(chip)"
            [title]="'Remove: ' + chip.displayLabel"
          >
            {{ chip.value }}
            <span class="chip-x">×</span>
          </span>
        </div>

        <!-- Filter groups -->
        <div class="fp-body">
          <div
            class="fg"
            *ngFor="let def of filterDefs; let i = index; trackBy: trackDef"
          >
            <div class="fg-header" (click)="toggleGroup(i)">
              <span class="fg-label">{{ def.label }}</span>
              <span class="fg-count" *ngIf="getActiveCount(def.id) > 0">{{
                getActiveCount(def.id)
              }}</span>
              <span class="fg-arrow" [class.open]="openGroups[i]">▾</span>
            </div>

            <div class="fg-options" [class.open]="openGroups[i]">
              <label
                class="fo"
                *ngFor="let opt of def.options; trackBy: trackOpt"
                [class.active]="filterState.isFilterActive(def.id, opt)"
              >
                <input
                  type="checkbox"
                  [checked]="filterState.isFilterActive(def.id, opt)"
                  (change)="onCheck(def.id, opt, $event)"
                />
                <span class="fo-label">{{ opt }}</span>
                <span
                  class="fo-dot"
                  [style.background]="getOptionColor(def.id, opt)"
                ></span>
              </label>
            </div>
          </div>
        </div>
      </ng-container>
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        flex-shrink: 0;
      }

      .filter-panel {
        width: 220px;
        height: 100%;
        background: #ffffff;
        border-right: 1px solid #e2e6f0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }
      .filter-panel.collapsed {
        width: 44px;
      }

      .fp-toggle {
        position: absolute;
        top: 12px;
        right: 8px;
        z-index: 10;
        width: 28px;
        height: 28px;
        border: 1px solid #e2e6f0;
        border-radius: 8px;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #6b7a99;
        transition: all 0.2s;
      }
      .fp-toggle:hover {
        background: #f0f2f8;
        color: #1a1f2e;
      }
      .fp-toggle .material-icons {
        font-size: 18px;
      }

      .fp-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 10px;
        border-bottom: 1px solid #e2e6f0;
        flex-shrink: 0;
        padding-right: 44px;
      }
      .fp-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fp-icon {
        font-size: 17px;
        color: #6366f1;
      }
      .fp-title {
        font-size: 13px;
        font-weight: 600;
        color: #1a1f2e;
      }
      .fp-badge {
        background: #6366f1;
        color: white;
        border-radius: 20px;
        font-size: 10px;
        font-weight: 700;
        padding: 1px 6px;
        min-width: 18px;
        text-align: center;
      }
      .fp-clear {
        font-size: 11px;
        color: #ef4444;
        background: none;
        border: none;
        cursor: pointer;
        padding: 3px 8px;
        border-radius: 6px;
        transition: background 0.15s;
        font-family: inherit;
      }
      .fp-clear:hover {
        background: #fef2f2;
      }

      .fp-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 8px 12px;
        border-bottom: 1px solid #e2e6f0;
        flex-shrink: 0;
      }
      .fp-chip {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        background: #eef2ff;
        color: #4f46e5;
        border: 1px solid #c7d2fe;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 500;
        padding: 2px 8px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .fp-chip:hover {
        background: #e0e7ff;
        border-color: #a5b4fc;
      }
      .chip-x {
        opacity: 0.6;
        font-size: 13px;
        line-height: 1;
      }
      .fp-chip:hover .chip-x {
        opacity: 1;
      }

      .fp-body {
        flex: 1;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #d1d8f0 transparent;
      }
      .fp-body::-webkit-scrollbar {
        width: 4px;
      }
      .fp-body::-webkit-scrollbar-thumb {
        background: #d1d8f0;
        border-radius: 2px;
      }

      .fg {
        border-bottom: 1px solid #f0f2f8;
      }

      .fg-header {
        display: flex;
        align-items: center;
        padding: 9px 16px;
        cursor: pointer;
        user-select: none;
        gap: 6px;
      }
      .fg-header:hover {
        background: #f8f9fd;
      }
      .fg-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        color: #9aa5be;
        flex: 1;
      }
      .fg-count {
        background: #eef2ff;
        color: #6366f1;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 700;
        padding: 0 5px;
      }
      .fg-arrow {
        font-size: 11px;
        color: #b0bcd4;
        transition: transform 0.2s;
        line-height: 1;
      }
      .fg-arrow.open {
        transform: rotate(180deg);
      }

      .fg-options {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.25s ease;
        padding: 0 16px;
      }
      .fg-options.open {
        max-height: 300px;
        padding: 4px 16px 10px;
      }

      .fo {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 0;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.12s;
      }
      .fo:hover .fo-label {
        color: #1a1f2e;
      }
      .fo.active .fo-label {
        color: #4f46e5;
        font-weight: 500;
      }
      .fo input[type='checkbox'] {
        width: 13px;
        height: 13px;
        accent-color: #6366f1;
        flex-shrink: 0;
        cursor: pointer;
      }
      .fo-label {
        font-size: 13px;
        color: #374151;
        flex: 1;
      }
      .fo-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .fo.active .fo-dot {
        opacity: 1;
      }
    `,
  ],
})
export class FilterPanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  filterDefs: FilterDefinition[] = [];
  activeChips: ActiveFilterChip[] = [];
  openGroups: boolean[] = [];
  collapsed = false;
  totalActiveFilters = 0;

  // Option color map for visual feedback
  private readonly OPTION_COLORS: Record<string, string> = {
    // Branches
    Downtown: '#6366f1',
    Uptown: '#10b981',
    Suburb: '#f59e0b',
    Mall: '#3b82f6',
    // Segments
    Premium: '#8b5cf6',
    Regular: '#3b82f6',
    Occasional: '#0ea5e9',
    New: '#10b981',
    // Status
    Critical: '#ef4444',
    Warning: '#f59e0b',
    Low: '#84cc16',
    Normal: '#10b981',
    // Default
    default: '#9aa5be',
  };

  constructor(
    public filterState: FilterStateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Update filter definitions when topic changes
    this.filterState.filterDefs$
      .pipe(takeUntil(this.destroy$))
      .subscribe((defs) => {
        this.filterDefs = defs;
        this.openGroups = defs.map(() => true);
        this.cdr.markForCheck();
      });

    // Update chips and badge count whenever state changes
    this.filterState.state$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.activeChips = this.filterState.activeChips;
      this.totalActiveFilters = this.activeChips.length;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleGroup(i: number) {
    this.openGroups[i] = !this.openGroups[i];
  }

  onCheck(filterId: string, value: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.filterState.toggleFilter(filterId, value, checked);
  }

  removeChip(chip: ActiveFilterChip) {
    this.filterState.toggleFilter(chip.filterId, chip.value, false);
  }

  clearAll() {
    this.filterState.clearAllFilters();
  }

  getActiveCount(filterId: string): number {
    return (this.filterState.snapshot.filters[filterId] || []).length;
  }

  getOptionColor(filterId: string, option: string): string {
    return this.OPTION_COLORS[option] || this.OPTION_COLORS['default'];
  }

  trackDef(_: number, def: FilterDefinition) {
    return def.id;
  }
  trackOpt(_: number, opt: string) {
    return opt;
  }
  trackChip(_: number, chip: ActiveFilterChip) {
    return chip.filterId + chip.value;
  }
}
