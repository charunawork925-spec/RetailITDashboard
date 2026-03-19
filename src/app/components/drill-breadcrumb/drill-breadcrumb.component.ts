// components/drill-breadcrumb/drill-breadcrumb.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { FilterStateService } from '../../services/filter-state.service';
import { DrillLevel, DRILL_CONFIGS } from '../../models/filter-state.model';

@Component({
  selector: 'app-drill-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="drill-breadcrumb" *ngIf="drillStack.length > 0">
      <!-- Breadcrumb trail -->
      <ng-container
        *ngFor="let item of drillStack; let i = index; let last = last"
      >
        <span class="bc-sep" *ngIf="i > 0">
          <span class="material-icons">chevron_right</span>
        </span>
        <button
          class="bc-item"
          [class.active]="last"
          [class.clickable]="!last"
          (click)="!last && drillTo(i)"
          [disabled]="last"
        >
          {{ item.label }}
        </button>
      </ng-container>

      <!-- Drill level badge -->
      <span class="bc-level-badge" *ngIf="drillStack.length > 1">
        Level {{ drillStack.length - 1 }}
      </span>

      <!-- Drill action buttons -->
      <div class="bc-actions">
        <button
          class="bc-drill-btn"
          (click)="drillDown()"
          *ngIf="canDrillDown"
          [title]="'Drill down to: ' + nextLevelLabel"
        >
          <span class="material-icons">south</span>
          {{ nextLevelLabel }}
        </button>
        <button
          class="bc-up-btn"
          (click)="drillUp()"
          *ngIf="drillStack.length > 1"
          title="Go up one level"
        >
          <span class="material-icons">north</span>
          Up
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .drill-breadcrumb {
        display: flex;
        align-items: center;
        gap: 2px;
        flex-wrap: wrap;
      }

      .bc-sep {
        display: flex;
        align-items: center;
        color: #b0bcd4;
      }
      .bc-sep .material-icons {
        font-size: 16px;
      }

      .bc-item {
        font-size: 12px;
        color: #6366f1;
        background: none;
        border: none;
        padding: 3px 6px;
        border-radius: 6px;
        font-family: inherit;
        cursor: default;
        font-weight: 500;
        transition: all 0.15s;
      }
      .bc-item.clickable {
        cursor: pointer;
        color: #6b7a99;
      }
      .bc-item.clickable:hover {
        background: #f0f2f8;
        color: #6366f1;
        text-decoration: underline;
      }
      .bc-item.active {
        color: #1a1f2e;
        font-weight: 600;
      }
      .bc-item:disabled {
        opacity: 1;
      }

      .bc-level-badge {
        background: #eef2ff;
        color: #6366f1;
        border: 1px solid #c7d2fe;
        border-radius: 20px;
        font-size: 10px;
        font-weight: 600;
        padding: 1px 8px;
        margin-left: 4px;
      }

      .bc-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-left: 8px;
      }

      .bc-drill-btn,
      .bc-up-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        border: 1px solid;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
      }
      .bc-drill-btn {
        background: rgba(99, 102, 241, 0.08);
        border-color: rgba(99, 102, 241, 0.3);
        color: #6366f1;
      }
      .bc-drill-btn:hover {
        background: rgba(99, 102, 241, 0.15);
        border-color: #6366f1;
      }
      .bc-up-btn {
        background: #f0f2f8;
        border-color: #e2e6f0;
        color: #6b7a99;
      }
      .bc-up-btn:hover {
        background: #e2e6f0;
        color: #1a1f2e;
      }
      .bc-drill-btn .material-icons,
      .bc-up-btn .material-icons {
        font-size: 14px;
      }
    `,
  ],
})
export class DrillBreadcrumbComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  drillStack: DrillLevel[] = [];
  canDrillDown = false;
  nextLevelLabel = '';

  constructor(
    public filterState: FilterStateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    combineLatest([this.filterState.drillStack$, this.filterState.drillConfig$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([stack, config]) => {
        this.drillStack = stack;
        const currentLevel = stack.length - 1;
        this.canDrillDown = currentLevel < config.length - 1;
        this.nextLevelLabel = config[currentLevel + 1]?.label ?? '';
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  drillTo(index: number) {
    this.filterState.drillTo(index);
  }

  drillDown() {
    const config = DRILL_CONFIGS[this.filterState.snapshot.topic];
    const nextLevel = config[this.drillStack.length];
    if (nextLevel) {
      this.filterState.drillDown(nextLevel.label, nextLevel.context);
    }
  }

  drillUp() {
    this.filterState.drillUp();
  }
}
