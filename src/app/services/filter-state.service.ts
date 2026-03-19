// services/filter-state.service.ts
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
} from 'rxjs';
import {
  ActiveFilterChip,
  DRILL_CONFIGS,
  FILTER_DEFINITIONS,
  FilterContext,
  FilterState,
  TopicId,
} from '../models/filter-state.model';

const INITIAL_STATE: FilterState = {
  topic: 'sales',
  filters: {},
  drillStack: [{ label: 'Overview', context: 'root' }],
};

@Injectable({ providedIn: 'root' })
export class FilterStateService {
  private _state$ = new BehaviorSubject<FilterState>({ ...INITIAL_STATE });

  // ── Public observables ──────────────────────────────────────────────────

  /** Full state stream */
  readonly state$ = this._state$.asObservable();

  /** Active topic */
  readonly topic$ = this._state$.pipe(
    map((s) => s.topic),
    distinctUntilChanged(),
  );

  /** Raw filters map */
  readonly filters$ = this._state$.pipe(
    map((s) => s.filters),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  );

  /** Drill breadcrumb stack */
  readonly drillStack$ = this._state$.pipe(
    map((s) => s.drillStack),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  );

  /** Numeric drill depth (0 = overview) */
  readonly drillLevel$ = this._state$.pipe(
    map((s) => s.drillStack.length - 1),
    distinctUntilChanged(),
  );

  /** Filter definitions for the currently active topic */
  readonly filterDefs$ = this._state$.pipe(
    map((s) => FILTER_DEFINITIONS[s.topic] || []),
    distinctUntilChanged((a, b) => a[0]?.id === b[0]?.id),
  );

  /**
   * Combined context observable — widgets subscribe to this ONE stream.
   * Fires whenever topic, filters, or drill level changes.
   */
  readonly activeContext$ = combineLatest([
    this.topic$,
    this.filters$,
    this.drillLevel$,
    this.drillStack$,
  ]).pipe(
    map(
      ([topic, filters, drillLevel, drillStack]): FilterContext => ({
        topic,
        filters,
        drillLevel,
        drillContext: drillStack.slice(1).map((d) => d.context),
      }),
    ),
  );

  /** Available drill levels for the active topic */
  readonly drillConfig$ = this._state$.pipe(
    map((s) => DRILL_CONFIGS[s.topic] || []),
  );

  /** Max drill depth for active topic */
  readonly maxDrillLevel$ = this.drillConfig$.pipe(
    map((config) => config.length - 1),
  );

  /** True when further drill-down is available */
  readonly canDrillDown$ = combineLatest([
    this.drillLevel$,
    this.maxDrillLevel$,
  ]).pipe(map(([current, max]) => current < max));

  // ── Getters for synchronous access ─────────────────────────────────────

  get snapshot(): FilterState {
    return this._state$.getValue();
  }

  get activeChips(): ActiveFilterChip[] {
    const state = this._state$.getValue();
    const defs = FILTER_DEFINITIONS[state.topic] || [];
    const chips: ActiveFilterChip[] = [];

    for (const [filterId, values] of Object.entries(state.filters)) {
      const def = defs.find((d) => d.id === filterId);
      (values || []).forEach((value) =>
        chips.push({
          filterId,
          value,
          displayLabel: `${def?.label ?? filterId}: ${value}`,
        }),
      );
    }
    return chips;
  }

  isFilterActive(filterId: string, value: string): boolean {
    return (this._state$.getValue().filters[filterId] || []).includes(value);
  }

  hasAnyFilters(): boolean {
    const filters = this._state$.getValue().filters;
    return Object.values(filters).some((arr) => arr.length > 0);
  }

  // ── Mutators ────────────────────────────────────────────────────────────

  /** Switch to a different topic — resets filters and drill */
  setTopic(topic: TopicId): void {
    this._state$.next({
      topic,
      filters: {},
      drillStack: [{ label: 'Overview', context: 'root' }],
    });
  }

  /** Toggle a single filter value on/off */
  toggleFilter(filterId: string, value: string, selected: boolean): void {
    const state = this._state$.getValue();
    const existing = state.filters[filterId] || [];

    const updated = selected
      ? [...new Set([...existing, value])]
      : existing.filter((v) => v !== value);

    const newFilters = { ...state.filters };
    if (updated.length === 0) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = updated;
    }

    this._state$.next({ ...state, filters: newFilters });
  }

  /** Set all values for a filter group at once */
  setFilter(filterId: string, values: string[]): void {
    const state = this._state$.getValue();
    const newFilters = { ...state.filters };
    if (values.length === 0) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = values;
    }
    this._state$.next({ ...state, filters: newFilters });
  }

  /** Remove a whole filter group */
  removeFilter(filterId: string): void {
    const state = this._state$.getValue();
    const newFilters = { ...state.filters };
    delete newFilters[filterId];
    this._state$.next({ ...state, filters: newFilters });
  }

  /** Clear all filters but keep topic and drill */
  clearFilters(): void {
    const state = this._state$.getValue();
    this._state$.next({ ...state, filters: {} });
  }

  /** Clear everything — filters, drill, back to overview */
  clearAllFilters(): void {
    this._state$.next({
      ...this._state$.getValue(),
      filters: {},
      drillStack: [{ label: 'Overview', context: 'root' }],
    });
  }

  /** Drill one level deeper */
  drillDown(levelLabel: string, context: string): void {
    const state = this._state$.getValue();
    const maxLevels = DRILL_CONFIGS[state.topic]?.length ?? 1;

    if (state.drillStack.length >= maxLevels) return;

    this._state$.next({
      ...state,
      drillStack: [...state.drillStack, { label: levelLabel, context }],
    });
  }

  /** Navigate to a specific breadcrumb index (0 = overview) */
  drillTo(index: number): void {
    const state = this._state$.getValue();
    if (index < 0 || index >= state.drillStack.length) return;
    this._state$.next({
      ...state,
      drillStack: state.drillStack.slice(0, index + 1),
    });
  }

  /** Go back one drill level */
  drillUp(): void {
    const state = this._state$.getValue();
    if (state.drillStack.length <= 1) return;
    this._state$.next({
      ...state,
      drillStack: state.drillStack.slice(0, -1),
    });
  }

  // ── Utility ─────────────────────────────────────────────────────────────

  /**
   * Given a filter context, compute a branch revenue multiplier.
   * Widgets can use this to scale mock data.
   */
  getBranchMultiplier(branches: string[]): number {
    if (!branches.length) return 1;
    const weights: Record<string, number> = {
      Downtown: 0.256,
      Uptown: 0.353,
      Suburb: 0.063,
      Mall: 0.065,
    };
    return branches.reduce((sum, b) => sum + (weights[b] ?? 0.08), 0);
  }

  /**
   * Given a filter context, compute a period multiplier relative to "month".
   */
  getPeriodMultiplier(periods: string[]): number {
    if (!periods.length) return 1;
    const first = periods[0];
    if (first === 'Today') return 1 / 30;
    if (first === 'This Week') return 7 / 30;
    if (first === 'This Year') return 12;
    return 1; // This Month is baseline
  }

  /**
   * Get a customer segment multiplier (fraction of total customers).
   */
  getSegmentMultiplier(segments: string[]): number {
    if (!segments.length) return 1;
    const weights: Record<string, number> = {
      Premium: 0.074,
      Regular: 0.279,
      Occasional: 0.455,
      New: 0.192,
    };
    return segments.reduce((sum, s) => sum + (weights[s] ?? 0.1), 0);
  }

  /**
   * Compute a combined multiplier from all active filters for mock data scaling.
   */
  computeEffectiveMultiplier(filters: Record<string, string[]>): number {
    let m = 1;
    if (filters['period']?.length)
      m *= this.getPeriodMultiplier(filters['period']);
    if (filters['branch']?.length)
      m *= this.getBranchMultiplier(filters['branch']) / 0.737;
    if (filters['segment']?.length)
      m *= this.getSegmentMultiplier(filters['segment']) / 1;
    return Math.max(m, 0.001);
  }
}
