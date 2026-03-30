import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart, registerables, ChartDataset } from 'chart.js';
import {
  Field,
  Dataset,
  ApiService,
  QueryRequest,
} from '../../../services/api.service';
Chart.register(...registerables);

export interface ActiveFilter {
  field: string;
  label: string;
  op: string;
  value: any;
}

export interface WidgetConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'kpi' | 'grid';
  dataset: string;
  dimensions: Field[];
  measures: Field[];
  filters: ActiveFilter[];
  span: number;
  data?: any;
  loading?: boolean;
  error?: string;
  warning?: string;
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#34d399',
  '#fbbf24',
  '#f87171',
  '#a78bfa',
];

@Component({
  selector: 'app-builder',
  imports: [CommonModule, FormsModule],
  templateUrl: './builder.html',
  styleUrl: './builder.css',
})
export class Builder implements OnInit {
  datasets: Dataset[] = [];
  filteredDatasets: Dataset[] = [];
  widgets: WidgetConfig[] = [];
  selectedId: string | null = null;
  searchQuery = '';
  openDatasets = new Set<string>();
  draggingField: (Field & { ds: string }) | null = null;
  runningAll = false;
  toast = '';
  private charts = new Map<string, Chart>();
  private idCounter = 0;

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.api.getDatasets().subscribe({
      next: (d) => {
        this.datasets = d;
        this.filteredDatasets = d;
        if (d.length > 0) this.openDatasets.add(d[0].id);
        if (d.length > 1) this.openDatasets.add(d[1].id);
        this.loadPresetIfAny();
      },
    });
  }

  // ── Field Panel ───────────────────────────────────────────
  filterFields(q: string) {
    if (!q) {
      this.filteredDatasets = this.datasets;
      return;
    }
    const lq = q.toLowerCase();
    this.filteredDatasets = this.datasets
      .map((ds) => ({
        ...ds,
        fields: ds.fields.filter((f) => f.label.toLowerCase().includes(lq)),
      }))
      .filter((ds) => ds.fields.length > 0);
    this.filteredDatasets.forEach((ds) => this.openDatasets.add(ds.id));
  }
  toggleDs(id: string) {
    this.openDatasets.has(id)
      ? this.openDatasets.delete(id)
      : this.openDatasets.add(id);
  }
  isOpen(id: string) {
    return this.openDatasets.has(id);
  }
  typeClass(t: string) {
    return (
      (
        {
          dim: 'ft-dim',
          msr: 'ft-msr',
          date: 'ft-date',
          bool: 'ft-bool',
        } as any
      )[t] || 'ft-dim'
    );
  }
  typeLabel(t: string) {
    return ({ dim: 'D', msr: 'M', date: 'T', bool: 'B' } as any)[t] || 'D';
  }

  // ── Drag & Drop ───────────────────────────────────────────
  onFieldDragStart(e: DragEvent, f: Field, dsId: string) {
    this.draggingField = { ...f, ds: dsId };
    e.dataTransfer!.effectAllowed = 'copy';
  }
  onFieldDragEnd() {
    this.draggingField = null;
  }
  allowDrop(e: DragEvent) {
    e.preventDefault();
  }

  onCanvasDrop(e: DragEvent) {
    e.preventDefault();
    if (!this.draggingField) return;
    this.addWidget(
      this.draggingField.type === 'msr' ? 'kpi' : 'bar',
      this.draggingField,
    );
  }
  onWidgetDrop(e: DragEvent, wid: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.draggingField) return;
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    this._addField(w, this.draggingField);
    this.showToast(`"${this.draggingField.label}" added`);
  }
  onAxisDrop(e: DragEvent, wid: string, axis: 'x' | 'y') {
    e.preventDefault();
    e.stopPropagation();
    if (!this.draggingField) return;
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    if (axis === 'y') {
      if (!w.measures.find((f) => f.key === this.draggingField!.key)) {
        w.measures = [...w.measures, { ...this.draggingField }];
        if (!w.dataset) w.dataset = this.draggingField.ds;
      }
    } else {
      if (!w.dimensions.find((f) => f.key === this.draggingField!.key)) {
        w.dimensions = [...w.dimensions, { ...this.draggingField }];
        if (!w.dataset) w.dataset = this.draggingField.ds;
      }
    }
  }
  private _addField(w: WidgetConfig, f: Field & { ds?: string }) {
    if (f.type === 'msr') {
      if (!w.measures.find((x) => x.key === f.key)) {
        w.measures = [...w.measures, { ...f }];
        if (!w.dataset && f.ds) w.dataset = f.ds;
      }
    } else {
      if (!w.dimensions.find((x) => x.key === f.key)) {
        w.dimensions = [...w.dimensions, { ...f }];
        if (!w.dataset && f.ds) w.dataset = f.ds;
      }
    }
  }

  // ── Widgets ───────────────────────────────────────────────
  addWidget(type: WidgetConfig['type'], hint?: Field & { ds?: string }) {
    const id = 'w' + ++this.idCounter;
    const titles: any = {
      bar: 'Bar Chart',
      line: 'Line Chart',
      pie: 'Pie Chart',
      kpi: 'KPI Card',
      grid: 'Data Grid',
    };
    const w: WidgetConfig = {
      id,
      type,
      title: hint ? hint.label + ' Analysis' : titles[type],
      dataset: (hint as any)?.ds || '',
      dimensions: hint && hint.type !== 'msr' ? [hint] : [],
      measures: hint && hint.type === 'msr' ? [hint] : [],
      filters: [],
      span: 6,
    };
    this.widgets = [...this.widgets, w];
    this.selectWidget(id);
  }
  removeWidget(id: string) {
    const ch = this.charts.get(id);
    if (ch) {
      ch.destroy();
      this.charts.delete(id);
    }
    this.widgets = this.widgets.filter((w) => w.id !== id);
    if (this.selectedId === id) this.selectedId = null;
  }
  selectWidget(id: string) {
    this.selectedId = id;
  }
  getSelected(): WidgetConfig | undefined {
    return this.widgets.find((w) => w.id === this.selectedId);
  }
  clearCanvas() {
    this.charts.forEach((c) => c.destroy());
    this.charts.clear();
    this.widgets = [];
    this.selectedId = null;
  }
  cycleSpan(w: WidgetConfig) {
    const s = [3, 4, 6, 8, 12];
    w.span = s[(s.indexOf(w.span) + 1) % s.length];
    setTimeout(() => this.renderChart(w.id), 80);
  }
  removeField(wid: string, key: string, axis: 'x' | 'y') {
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    if (axis === 'x') w.dimensions = w.dimensions.filter((f) => f.key !== key);
    else w.measures = w.measures.filter((f) => f.key !== key);
  }
  updateWidgetType(wid: string, type: string) {
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    w.type = type as any;
    const ch = this.charts.get(wid);
    if (ch) {
      ch.destroy();
      this.charts.delete(wid);
    }
    if (w.data) setTimeout(() => this.renderChart(wid), 80);
  }
  updateWidgetDataset(wid: string, dsId: string) {
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    w.dataset = dsId;
    w.dimensions = [];
    w.measures = [];
    w.filters = [];
    w.data = undefined;
    w.warning = undefined;
  }
  getSpanClass(span: number) {
    return 'span-' + span;
  }
  getDsLabel(dsId: string) {
    return this.datasets.find((d) => d.id === dsId)?.label || '—';
  }
  isMeasure(w: WidgetConfig, col: string) {
    return !!w.measures?.some((m) => m.key === col);
  }

  // ── FILTERS ───────────────────────────────────────────────
  getDsMeta(dsId: string): any {
    return this.datasets.find((d) => d.id === dsId) || null;
  }

  getFilterFields(dsId: string): string[] {
    return (this.getDsMeta(dsId) as any)?.filter_fields || [];
  }

  getFilterOptions(dsId: string, field: string): any[] {
    return (this.getDsMeta(dsId) as any)?.filter_options?.[field] || [];
  }

  getFilterLabel(dsId: string, field: string): string {
    const ds = this.getDsMeta(dsId);
    return ds?.fields?.find((f: any) => f.key === field)?.label || field;
  }

  addFilter(w: WidgetConfig, field: string) {
    if (!field || w.filters.find((f) => f.field === field)) return;
    w.filters = [
      ...w.filters,
      {
        field,
        label: this.getFilterLabel(w.dataset, field),
        op: '=',
        value: '',
      },
    ];
  }

  removeFilter(w: WidgetConfig, field: string) {
    w.filters = w.filters.filter((f) => f.field !== field);
  }

  updateFilterValue(w: WidgetConfig, field: string, value: any) {
    const f = w.filters.find((x) => x.field === field);
    if (f) f.value = value;
  }

  getActiveFilters(w: WidgetConfig): ActiveFilter[] {
    return w.filters.filter(
      (f) => f.value !== '' && f.value !== null && f.value !== undefined,
    );
  }

  // ── Query ─────────────────────────────────────────────────
  runWidget(w: WidgetConfig) {
    if (!w.dataset || (!w.dimensions.length && !w.measures.length)) {
      this.showToast('Add at least one field first');
      return;
    }
    w.loading = true;
    w.error = undefined;
    w.warning = undefined;
    const activeFilters = this.getActiveFilters(w).map((f) => ({
      field: f.field,
      op: f.op,
      value:
        typeof f.value === 'string' &&
        (f.value === 'true' || f.value === 'false')
          ? f.value === 'true'
          : f.value,
    }));
    const req: QueryRequest = {
      dataset: w.dataset,
      dimensions: w.dimensions.map((f) => f.key),
      measures: w.measures.map((f) => f.key),
      filters: activeFilters,
      limit: w.type === 'grid' ? 100 : 25,
      order_dir: 'DESC',
    };
    if (w.measures.length) req.order_by = w.measures[0].key;
    this.api.query(req).subscribe({
      next: (res) => {
        w.loading = false;
        w.data = res;
        w.warning = (res as any).chart?.warning || undefined;
        if (w.type !== 'kpi' && w.type !== 'grid')
          setTimeout(() => this.renderChart(w.id), 80);
      },
      error: (err) => {
        w.loading = false;
        w.error = err.error?.detail || 'Query failed';
      },
    });
  }

  runAll() {
    this.runningAll = true;
    this.widgets.forEach((w) => this.runWidget(w));
    setTimeout(() => {
      this.runningAll = false;
      this.showToast('✓ All widgets refreshed');
    }, 1400);
  }

  // ── Chart Renderer ────────────────────────────────────────
  renderChart(id: string) {
    const w = this.widgets.find((x) => x.id === id);
    if (!w || !w.data || w.type === 'kpi' || w.type === 'grid') return;
    const canvas = document.getElementById('canvas-' + id) as HTMLCanvasElement;
    if (!canvas) return;
    const old = this.charts.get(id);
    if (old) {
      old.destroy();
      this.charts.delete(id);
    }
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = '#252a3d';
    Chart.defaults.font.family = 'Outfit';
    Chart.defaults.font.size = 11;
    const cp = (w.data as any).chart;
    if (!cp || !cp.labels?.length) return;
    const { labels, datasets: raw, dualAxis } = cp;
    const multi = raw.length > 1;

    if (w.type === 'pie') {
      this.charts.set(
        id,
        new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [
              {
                data: raw[0]?.data || [],
                backgroundColor: COLORS,
                borderWidth: 2,
                borderColor: '#13161f',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: {
                position: 'right',
                labels: { boxWidth: 10, padding: 10, font: { size: 10 } },
              },
            },
          },
        }),
      );
      return;
    }

    const mkScales = (type: 'bar' | 'line') => {
      const sc: any = {
        x: { grid: { display: type === 'line', color: '#252a3d' } },
        y: {
          grid: { color: '#252a3d' },
          position: 'left',
          title: {
            display: dualAxis,
            text: w.measures[0]?.label || '',
            color: COLORS[0],
            font: { size: 10 },
          },
        },
      };
      if (dualAxis)
        sc['y1'] = {
          grid: { drawOnChartArea: false },
          position: 'right',
          title: {
            display: true,
            text: w.measures[1]?.label || '',
            color: COLORS[1],
            font: { size: 10 },
          },
        };
      return sc;
    };

    if (w.type === 'line') {
      const ds: ChartDataset<'line'>[] = raw.map((d: any, i: number) => ({
        label: d.label,
        data: d.data,
        borderColor: COLORS[i % COLORS.length],
        backgroundColor: COLORS[i % COLORS.length] + '18',
        tension: 0.4,
        fill: i === 0,
        pointRadius: 3,
        pointBackgroundColor: COLORS[i % COLORS.length],
        pointBorderColor: '#07080f',
        pointBorderWidth: 2,
        yAxisID: dualAxis ? (i === 0 ? 'y' : 'y1') : 'y',
      }));
      this.charts.set(
        id,
        new Chart(canvas, {
          type: 'line',
          data: { labels, datasets: ds },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: multi,
                labels: { boxWidth: 10, padding: 10, font: { size: 10 } },
              },
            },
            scales: mkScales('line'),
          },
        }),
      );
      return;
    }

    const ds: ChartDataset<'bar'>[] = raw.map((d: any, i: number) => ({
      label: d.label,
      data: d.data,
      backgroundColor: COLORS[i % COLORS.length] + 'cc',
      borderColor: COLORS[i % COLORS.length],
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false as any,
      yAxisID: dualAxis ? (i === 0 ? 'y' : 'y1') : 'y',
    }));
    this.charts.set(
      id,
      new Chart(canvas, {
        type: 'bar',
        data: { labels, datasets: ds },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: multi,
              labels: { boxWidth: 10, padding: 10, font: { size: 10 } },
            },
            tooltip: {
              callbacks: {
                label: (ctx: any) => {
                  const v = ctx.parsed.y;
                  return ` ${ctx.dataset.label}: ${v >= 1_000_000 ? 'LKR ' + (v / 1_000_000).toFixed(2) + 'M' : v >= 1_000 ? v.toLocaleString() : v}`;
                },
              },
            },
          },
          scales: mkScales('bar'),
        },
      }),
    );
  }

  // ── KPI helpers ───────────────────────────────────────────
  getKpiValue(w: WidgetConfig): string {
    if (!w.data?.rows?.length) return '—';
    const r = w.data.rows[0];
    const key = w.measures[0]?.key;
    const v = key ? r[key] : null;
    if (v == null) return '—';
    const n = parseFloat(v);
    if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(1)}K`;
    return String(v);
  }
  getMsrSummary(
    w: WidgetConfig,
  ): { label: string; value: string; color: string }[] {
    if (!w.data?.rows?.length) return [];
    return w.measures.map((m, i) => {
      const sum = w.data!.rows.reduce(
        (a: number, r: any) => a + (parseFloat(r[m.key]) || 0),
        0,
      );
      const fmt =
        sum >= 1_000_000
          ? `LKR ${(sum / 1_000_000).toFixed(2)}M`
          : sum >= 1_000
            ? sum.toLocaleString()
            : String(Math.round(sum));
      return { label: m.label, value: fmt, color: COLORS[i % COLORS.length] };
    });
  }

  // ── Preset loader ─────────────────────────────────────────
  // loadPresetIfAny() {
  //   const raw = sessionStorage.getItem('loadPreset');
  //   if (!raw) return;
  //   sessionStorage.removeItem('loadPreset');
  //   const preset = JSON.parse(raw);
  //   const interval = setInterval(() => {
  //     if (!this.datasets.length) return;
  //     clearInterval(interval);
  //     preset.widgets.forEach((wCfg: any) => {
  //       const id = 'w' + ++this.idCounter;
  //       const ds = this.datasets.find((d: any) => d.id === wCfg.dataset);
  //       const dims = wCfg.dimensions
  //         .map((k: string) => ds?.fields.find((f: any) => f.key === k))
  //         .filter(Boolean);
  //       const msrs = wCfg.measures
  //         .map((k: string) => ds?.fields.find((f: any) => f.key === k))
  //         .filter(Boolean);
  //       const w: WidgetConfig = {
  //         id,
  //         type: wCfg.type,
  //         title: wCfg.title,
  //         dataset: wCfg.dataset,
  //         dimensions: dims,
  //         measures: msrs,
  //         filters: [],
  //         span: 6,
  //       };
  //       this.widgets = [...this.widgets, w];
  //       this.runWidget(w);
  //     });
  //     this.showToast(`✓ "${preset.name}" loaded!`);
  //   }, 200);
  // }

  // Fix the loadPresetIfAny method
  loadPresetIfAny() {
    const raw = sessionStorage.getItem('loadPreset');
    if (!raw) return;
    sessionStorage.removeItem('loadPreset');
    const preset = JSON.parse(raw);
    const interval = setInterval(() => {
      if (!this.datasets.length) return;
      clearInterval(interval);
      preset.widgets.forEach((wCfg: any) => {
        const id = 'w' + ++this.idCounter;
        const ds = this.datasets.find((d: any) => d.id === wCfg.dataset);

        // Fix: Ensure ds exists before mapping
        if (!ds) {
          console.warn(`Dataset ${wCfg.dataset} not found`);
          return;
        }

        // Fix: Use type-safe find with proper undefined handling
        const dims = wCfg.dimensions
          .map((k: string) => {
            const field = ds.fields.find((f: any) => f.key === k);
            return field || null;
          })
          .filter((field: any): field is Field => field !== null);

        const msrs = wCfg.measures
          .map((k: string) => {
            const field = ds.fields.find((f: any) => f.key === k);
            return field || null;
          })
          .filter((field: any): field is Field => field !== null);

        const w: WidgetConfig = {
          id,
          type: wCfg.type,
          title: wCfg.title,
          dataset: wCfg.dataset,
          dimensions: dims,
          measures: msrs,
          filters: [],
          span: 6,
        };
        this.widgets = [...this.widgets, w];
        this.runWidget(w);
      });
      this.showToast(`✓ "${preset.name}" loaded!`);
    }, 200);
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => (this.toast = ''), 2800);
  }
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // Add these helper methods to your Builder class

  // Check if a filter already exists for a field
  isFilterExists(w: WidgetConfig, field: string): boolean {
    return w.filters.some((f) => f.field === field);
  }

  // Get available filter fields (excluding already added ones)
  getAvailableFilterFields(
    w: WidgetConfig,
  ): { field: string; label: string }[] {
    if (!w.dataset) return [];

    const filterFields = this.getFilterFields(w.dataset);
    const existingFields = new Set(w.filters.map((f) => f.field));

    return filterFields
      .filter((field) => !existingFields.has(field))
      .map((field) => ({
        field,
        label: this.getFilterLabel(w.dataset, field),
      }));
  }
}
