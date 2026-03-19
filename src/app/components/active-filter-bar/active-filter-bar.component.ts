// components/active-filter-bar/active-filter-bar.component.ts
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
import { ActiveFilterChip } from '../../models/filter-state.model';

@Component({
  selector: 'app-active-filter-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="afb" [class.has-filters]="chips.length > 0 || drillLevel > 0">
      <ng-container *ngIf="chips.length > 0 || drillLevel > 0; else noFilters">
        <span class="afb-label">
          <span class="material-icons">filter_alt</span>
          Filtered by:
        </span>

        <!-- Filter chips -->
        <span
          class="af-chip"
          *ngFor="let chip of chips; trackBy: trackChip"
          (click)="removeChip(chip)"
        >
          <span class="chip-key">{{ chip.displayLabel.split(':')[0] }}:</span>
          <span class="chip-val">{{ chip.value }}</span>
          <span class="chip-x">×</span>
        </span>

        <!-- Drill context chip -->
        <span
          class="af-chip drill-chip"
          *ngIf="drillLevel > 0"
          (click)="resetDrill()"
        >
          <span class="material-icons" style="font-size:12px">south</span>
          <span class="chip-val">{{ drillLabel }}</span>
          <span class="chip-x">×</span>
        </span>

        <button class="afb-clear" (click)="clearAll()">
          <span class="material-icons">close</span>
          Clear all
        </button>
      </ng-container>

      <ng-template #noFilters>
        <span class="afb-empty">
          <span class="material-icons">info_outline</span>
          No filters applied — showing all data
        </span>
      </ng-template>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        flex-shrink: 0;
      }

      .afb {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        padding: 7px 20px;
        background: #fafbff;
        border-bottom: 1px solid #e2e6f0;
        min-height: 40px;
        transition: background 0.2s;
      }
      .afb.has-filters {
        background: #f0f2ff;
      }

      .afb-label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        color: #6366f1;
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .afb-label .material-icons {
        font-size: 14px;
      }

      .af-chip {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        background: #ffffff;
        border: 1px solid #c7d2fe;
        border-radius: 20px;
        font-size: 11px;
        padding: 3px 10px;
        cursor: pointer;
        transition: all 0.15s;
        white-space: nowrap;
      }
      .af-chip:hover {
        border-color: #f87171;
        background: #fef2f2;
      }
      .af-chip:hover .chip-x {
        color: #ef4444;
      }

      .chip-key {
        color: #9aa5be;
      }
      .chip-val {
        color: #1a1f2e;
        font-weight: 500;
      }
      .chip-x {
        color: #b0bcd4;
        font-size: 13px;
        margin-left: 2px;
      }

      .drill-chip {
        border-color: #a7f3d0;
        background: #ecfdf5;
      }
      .drill-chip .chip-val {
        color: #059669;
      }
      .drill-chip:hover {
        border-color: #f87171;
        background: #fef2f2;
      }
      .drill-chip .material-icons {
        color: #059669;
      }

      .afb-clear {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        color: #ef4444;
        background: none;
        border: none;
        cursor: pointer;
        padding: 3px 8px;
        border-radius: 6px;
        font-family: inherit;
        margin-left: 4px;
        transition: background 0.15s;
      }
      .afb-clear:hover {
        background: #fef2f2;
      }
      .afb-clear .material-icons {
        font-size: 13px;
      }

      .afb-empty {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: #9aa5be;
        font-style: italic;
      }
      .afb-empty .material-icons {
        font-size: 14px;
      }
    `,
  ],
})
export class ActiveFilterBarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  chips: ActiveFilterChip[] = [];
  drillLevel = 0;
  drillLabel = '';

  constructor(
    private filterState: FilterStateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.filterState.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.chips = this.filterState.activeChips;
        this.drillLevel = state.drillStack.length - 1;
        this.drillLabel = state.drillStack
          .slice(1)
          .map((d) => d.label)
          .join(' › ');
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeChip(chip: ActiveFilterChip) {
    this.filterState.toggleFilter(chip.filterId, chip.value, false);
  }

  resetDrill() {
    this.filterState.drillTo(0);
  }

  clearAll() {
    this.filterState.clearAllFilters();
  }

  trackChip(_: number, chip: ActiveFilterChip) {
    return chip.filterId + chip.value;
  }
}
