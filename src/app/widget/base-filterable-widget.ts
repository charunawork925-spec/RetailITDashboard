// widgets/base-filterable-widget.ts
/**
 * Base class for all widgets that need to react to filter + drill state.
 *
 * Usage:
 *   @Component({ ... })
 *   export class MyWidget extends BaseFilterableWidget implements OnInit, OnDestroy {
 *     constructor(filterState: FilterStateService, cdr: ChangeDetectorRef) {
 *       super(filterState, cdr);
 *     }
 *     ngOnInit() { this.initFilter(); }
 *     ngOnDestroy() { this.destroyFilter(); }
 *
 *     protected onFilterChange(ctx: FilterContext): void {
 *       // Recompute your widget's data here
 *     }
 *   }
 */

import { ChangeDetectorRef, Directive, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FilterStateService } from '../services/filter-state.service';
import { FilterContext } from '../models/filter-state.model';

@Directive()
export abstract class BaseFilterableWidget implements OnDestroy {
  protected destroy$ = new Subject<void>();
  protected filterContext: FilterContext | null = null;

  constructor(
    protected filterState: FilterStateService,
    protected cdr: ChangeDetectorRef,
  ) {}

  /** Call in ngOnInit */
  protected initFilter(): void {
    this.filterState.activeContext$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ctx) => {
        this.filterContext = ctx;
        this.onFilterChange(ctx);
        this.cdr.markForCheck();
      });
  }

  /** Override in widget to handle filter changes */
  protected abstract onFilterChange(ctx: FilterContext): void;

  /** Call in ngOnDestroy */
  protected destroyFilter(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy(): void {
    this.destroyFilter();
  }

  // ── Convenience helpers ──────────────────────────────────────────────────

  /** True if a specific filter has any active values */
  protected hasFilter(filterId: string): boolean {
    return (this.filterContext?.filters[filterId]?.length ?? 0) > 0;
  }

  /** Get active values for a filter, or empty array */
  protected getFilterValues(filterId: string): string[] {
    return this.filterContext?.filters[filterId] ?? [];
  }

  /** Current drill depth */
  protected get drillLevel(): number {
    return this.filterContext?.drillLevel ?? 0;
  }

  /** Current drill context breadcrumb (e.g. ['category', 'product']) */
  protected get drillContextPath(): string[] {
    return this.filterContext?.drillContext ?? [];
  }

  /** Active topic */
  protected get activeTopic(): string {
    return this.filterContext?.topic ?? 'sales';
  }

  /**
   * Filter an array of items by a given field against active filter values.
   * If no filter is active for that field, returns all items.
   */
  protected filterItems<T>(
    items: T[],
    filterId: string,
    fieldSelector: (item: T) => string,
  ): T[] {
    const values = this.getFilterValues(filterId);
    if (!values.length) return items;
    return items.filter((item) =>
      values.some((v) =>
        fieldSelector(item).toLowerCase().includes(v.toLowerCase()),
      ),
    );
  }

  /**
   * Compute effective data multiplier based on active branch + period filters.
   */
  protected computeMultiplier(): number {
    return this.filterState.computeEffectiveMultiplier(
      this.filterContext?.filters ?? {},
    );
  }
}
