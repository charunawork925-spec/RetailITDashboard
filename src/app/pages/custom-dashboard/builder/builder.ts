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
  type:
    | 'bar'
    | 'line'
    | 'pie'
    | 'kpi'
    | 'grid'
    | 'hbar'
    | 'stacked'
    | 'area'
    | 'doughnut';
  dataset: string;
  joinDataset: string;
  dimensions: Field[];
  measures: Field[];
  aggFunctions: Record<string, string>;
  filters: ActiveFilter[];
  span: number;
  showTable: boolean;
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
  toastType: 'success' | 'error' = 'success';
  private charts = new Map<string, Chart>();
  private idCounter = 0;
  readonly AGG_OPTIONS = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX'];

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

  getJoinTargets(dsId: string): string[] {
    return (this.getDsMeta(dsId) as any)?.join_targets || [];
  }

  getMergedFields(w: WidgetConfig): Field[] {
    const primary = this.getDsMeta(w.dataset)?.fields || [];
    if (!w.joinDataset) return primary;
    const joinFields = this.getDsMeta(w.joinDataset)?.fields || [];
    const seen = new Set(primary.map((f: Field) => f.key));
    return [...primary, ...joinFields.filter((f: Field) => !seen.has(f.key))];
  }

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

  addWidget(type: WidgetConfig['type'], hint?: Field & { ds?: string }) {
    const id = 'w' + ++this.idCounter;
    const titles: any = {
      bar: 'Bar Chart',
      line: 'Line Chart',
      pie: 'Pie Chart',
      kpi: 'KPI Card',
      grid: 'Data Grid',
      hbar: 'Horizontal Bar',
      stacked: 'Stacked Bar',
      area: 'Area Chart',
      doughnut: 'Doughnut',
    };
    const w: WidgetConfig = {
      id,
      type,
      title: hint ? hint.label + ' Analysis' : titles[type],
      dataset: (hint as any)?.ds || '',
      joinDataset: '',
      dimensions: hint && hint.type !== 'msr' ? [hint] : [],
      measures: hint && hint.type === 'msr' ? [hint] : [],
      aggFunctions: {},
      filters: [],
      span: 6,
      showTable: false,
    };
    this.widgets = [...this.widgets, w];
    this.selectWidget(id);
  }

  duplicateWidget(id: string) {
    const orig = this.widgets.find((x) => x.id === id);
    if (!orig) return;
    const newId = 'w' + ++this.idCounter;
    const copy: WidgetConfig = JSON.parse(
      JSON.stringify({
        ...orig,
        id: newId,
        title: orig.title + ' (copy)',
        data: undefined,
        loading: false,
        error: undefined,
      }),
    );
    const idx = this.widgets.findIndex((x) => x.id === id);
    const arr = [...this.widgets];
    arr.splice(idx + 1, 0, copy);
    this.widgets = arr;
    this.showToast('Widget duplicated');
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
  toggleTable(w: WidgetConfig) {
    w.showTable = !w.showTable;
    if (!w.showTable) setTimeout(() => this.renderChart(w.id), 80);
  }
  removeField(wid: string, key: string, axis: 'x' | 'y') {
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    if (axis === 'x') w.dimensions = w.dimensions.filter((f) => f.key !== key);
    else {
      w.measures = w.measures.filter((f) => f.key !== key);
      delete w.aggFunctions[key];
    }
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
    if (w.data && !w.showTable) setTimeout(() => this.renderChart(wid), 80);
  }
  updateWidgetDataset(wid: string, dsId: string) {
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    w.dataset = dsId;
    w.joinDataset = '';
    w.dimensions = [];
    w.measures = [];
    w.filters = [];
    w.aggFunctions = {};
    w.data = undefined;
    w.warning = undefined;
  }
  updateJoinDataset(wid: string, joinId: string) {
    const w = this.widgets.find((x) => x.id === wid);
    if (w) w.joinDataset = joinId;
  }
  setAgg(w: WidgetConfig, key: string, fn: string) {
    w.aggFunctions = { ...w.aggFunctions, [key]: fn };
  }
  getSpanClass(span: number) {
    return 'span-' + span;
  }
  getDsLabel(dsId: string) {
    return this.datasets.find((d) => d.id === dsId)?.label || '—';
  }
  getDsMeta(dsId: string): any {
    return this.datasets.find((d) => d.id === dsId) || null;
  }
  isMeasure(w: WidgetConfig, col: string) {
    return !!w.measures?.some((m) => m.key === col);
  }

  getFilterableFields(dsId: string): Field[] {
    const ds = this.getDsMeta(dsId);
    if (!ds || !ds.filter_fields?.length) return [];
    return ds.filter_fields
      .map((k: string) => ds.fields.find((f: Field) => f.key === k))
      .filter(Boolean) as Field[];
  }
  getFilterOptions(dsId: string, key: string): { label: string; value: any }[] {
    return this.getDsMeta(dsId)?.filter_options?.[key] || [];
  }
  onAddFilterSelect(w: WidgetConfig, e: Event) {
    const key = (e.target as HTMLSelectElement).value;
    if (!key) return;
    (e.target as HTMLSelectElement).value = '';
    if (w.filters.find((f) => f.field === key)) return;
    const fld = this.getDsMeta(w.dataset)?.fields?.find(
      (f: Field) => f.key === key,
    );
    w.filters = [
      ...w.filters,
      { field: key, label: fld?.label || key, op: '=', value: '' },
    ];
  }
  removeFilter(w: WidgetConfig, field: string) {
    w.filters = w.filters.filter((f) => f.field !== field);
  }
  getActiveFilters(w: WidgetConfig): ActiveFilter[] {
    return w.filters.filter(
      (f) => f.value !== '' && f.value !== null && f.value !== undefined,
    );
  }

  exportCSV(w: WidgetConfig) {
    if (!w.data?.rows?.length) {
      this.showToast('No data to export', 'error');
      return;
    }
    const cols = w.data.columns as string[];
    const csv = [
      cols.join(','),
      ...(w.data.rows as any[]).map((r: any) =>
        cols.map((c) => `"${r[c] ?? ''}"`).join(','),
      ),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${w.title.replace(/\s+/g, '_')}.csv`;
    a.click();
    this.showToast('CSV downloaded');
  }

  exportPNG(w: WidgetConfig) {
    const chart = this.charts.get(w.id);
    if (!chart) {
      this.showToast('Run the chart first', 'error');
      return;
    }
    const a = document.createElement('a');
    a.href = chart.toBase64Image();
    a.download = `${w.title.replace(/\s+/g, '_')}.png`;
    a.click();
    this.showToast('Chart saved as PNG');
  }

  runWidget(w: WidgetConfig) {
    if (!w.dataset || (!w.dimensions.length && !w.measures.length)) {
      this.showToast('Add at least one field first', 'error');
      return;
    }
    w.loading = true;
    w.error = undefined;
    w.warning = undefined;
    const apiFilters = this.getActiveFilters(w).map((f) => ({
      field: f.field,
      op: f.op,
      value: f.value === 'true' ? true : f.value === 'false' ? false : f.value,
    }));
    const req: any = {
      dataset: w.dataset,
      dimensions: w.dimensions.map((f) => f.key),
      measures: w.measures.map((f) => f.key),
      filters: apiFilters,
      limit: w.type === 'grid' ? 200 : 50,
      order_dir: 'DESC',
      join_dataset: w.joinDataset || null,
      agg_functions: w.aggFunctions || {},
    };
    if (w.measures.length) req.order_by = w.measures[0].key;
    this.api.query(req as QueryRequest).subscribe({
      next: (res) => {
        w.loading = false;
        w.data = res;
        w.warning = (res as any).chart?.warning || undefined;
        if (!['kpi', 'grid'].includes(w.type) && !w.showTable)
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
      this.showToast('All widgets refreshed');
    }, 1400);
  }

  renderChart(id: string) {
    const w = this.widgets.find((x) => x.id === id);
    if (!w || !w.data || ['kpi', 'grid'].includes(w.type)) return;
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

    const fmtV = (v: number) =>
      v >= 1_000_000
        ? `LKR ${(v / 1_000_000).toFixed(2)}M`
        : v >= 1_000
          ? v.toLocaleString()
          : String(typeof v === 'number' ? v.toFixed(2) : v);
    const tooltip = {
      callbacks: {
        label: (ctx: any) =>
          ` ${ctx.dataset.label}: ${fmtV(ctx.parsed.y ?? ctx.parsed)}`,
      },
    };
    const legend = {
      display: multi,
      labels: { boxWidth: 10, padding: 10, font: { size: 10 } },
    };

    if (w.type === 'pie' || w.type === 'doughnut') {
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
            cutout: w.type === 'doughnut' ? '65%' : '45%',
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

    const mkY = () => {
      const sc: any = {
        x: { grid: { display: false } },
        y: {
          grid: { color: '#252a3d' },
          position: 'left',
          ticks: { callback: (v: any) => fmtV(v) },
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
    const mkX = () => ({
      x: {
        grid: { color: '#252a3d' },
        ticks: { callback: (v: any) => fmtV(v) },
      },
      y: { grid: { display: false } },
    });

    if (w.type === 'hbar') {
      const ds: ChartDataset<'bar'>[] = raw.map((d: any, i: number) => ({
        label: d.label,
        data: d.data,
        backgroundColor: COLORS[i % COLORS.length] + 'cc',
        borderColor: COLORS[i % COLORS.length],
        borderWidth: 1,
        borderRadius: 4,
      }));
      this.charts.set(
        id,
        new Chart(canvas, {
          type: 'bar',
          data: { labels, datasets: ds },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend, tooltip },
            scales: mkX(),
          },
        }),
      );
      return;
    }
    if (w.type === 'area') {
      const ds: ChartDataset<'line'>[] = raw.map((d: any, i: number) => ({
        label: d.label,
        data: d.data,
        borderColor: COLORS[i % COLORS.length],
        backgroundColor: COLORS[i % COLORS.length] + '40',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
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
            plugins: { legend, tooltip },
            scales: mkY(),
          },
        }),
      );
      return;
    }
    if (w.type === 'stacked') {
      const ds: ChartDataset<'bar'>[] = raw.map((d: any, i: number) => ({
        label: d.label,
        data: d.data,
        backgroundColor: COLORS[i % COLORS.length] + 'cc',
        borderColor: COLORS[i % COLORS.length],
        borderWidth: 1,
        borderRadius: 2,
        borderSkipped: false as any,
      }));
      this.charts.set(
        id,
        new Chart(canvas, {
          type: 'bar',
          data: { labels, datasets: ds },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend, tooltip },
            scales: {
              x: { stacked: true, grid: { display: false } },
              y: {
                stacked: true,
                grid: { color: '#252a3d' },
                ticks: { callback: (v: any) => fmtV(v) },
              },
            },
          },
        }),
      );
      return;
    }
    if (w.type === 'line') {
      const ds: ChartDataset<'line'>[] = raw.map((d: any, i: number) => ({
        label: d.label,
        data: d.data,
        borderColor: COLORS[i % COLORS.length],
        backgroundColor: COLORS[i % COLORS.length] + '18',
        tension: 0.4,
        fill: false,
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
            plugins: { legend, tooltip },
            scales: mkY(),
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
          plugins: { legend, tooltip },
          scales: mkY(),
        },
      }),
    );
  }

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
        const dims = wCfg.dimensions
          .map((k: string) => ds?.fields.find((f: any) => f.key === k))
          .filter(Boolean);
        const msrs = wCfg.measures
          .map((k: string) => ds?.fields.find((f: any) => f.key === k))
          .filter(Boolean);
        const w: WidgetConfig = {
          id,
          type: wCfg.type,
          title: wCfg.title,
          dataset: wCfg.dataset,
          joinDataset: wCfg.join_dataset || '',
          dimensions: dims,
          measures: msrs,
          aggFunctions: {},
          filters: wCfg.filters || [],
          span: 6,
          showTable: false,
        };
        this.widgets = [...this.widgets, w];
        this.runWidget(w);
      });
      this.showToast(`"${preset.name}" loaded!`);
    }, 200);
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 2800);
  }
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  isFilterSelected(w: WidgetConfig, key: string): boolean {
    return !!w.filters.find((f) => f.field === key);
  }
}
