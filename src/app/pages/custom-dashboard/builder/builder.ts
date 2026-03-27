import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables, ChartDataset } from 'chart.js';
import {
  Field,
  Dataset,
  ApiService,
  QueryRequest,
} from '../../../services/api.service';
import { Router } from '@angular/router';
Chart.register(...registerables);

export interface WidgetConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'kpi' | 'grid';
  dataset: string;
  dimensions: Field[];
  measures: Field[];
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
    const type = this.draggingField.type === 'msr' ? 'kpi' : 'bar';
    this.addWidget(type, this.draggingField);
  }

  onWidgetDrop(e: DragEvent, wid: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.draggingField) return;
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    this._addFieldToWidget(w, this.draggingField);
    this.showToast(`"${this.draggingField.label}" added to widget`);
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

  private _addFieldToWidget(w: WidgetConfig, f: Field & { ds?: string }) {
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
    const spans = [3, 4, 6, 8, 12];
    w.span = spans[(spans.indexOf(w.span) + 1) % spans.length];
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
    w.data = undefined;
    w.warning = undefined;
  }

  getSpanClass(span: number) {
    return 'span-' + span;
  }
  getDsLabel(dsId: string) {
    return this.datasets.find((d) => d.id === dsId)?.label || '—';
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

    const req: QueryRequest = {
      dataset: w.dataset,
      dimensions: w.dimensions.map((f) => f.key),
      measures: w.measures.map((f) => f.key),
      limit: w.type === 'grid' ? 100 : 25,
      order_dir: 'DESC',
    };
    if (w.measures.length) req.order_by = w.measures[0].key;

    this.api.query(req).subscribe({
      next: (res) => {
        w.loading = false;
        w.data = res;
        w.warning = (res as any).chart?.warning || undefined;
        if (w.type !== 'kpi' && w.type !== 'grid') {
          setTimeout(() => this.renderChart(w.id), 80);
        }
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

  // ── CHART RENDERER ────────────────────────────────────────
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

    const chartPayload = (w.data as any).chart;
    if (!chartPayload || !chartPayload.labels?.length) return;

    const { labels, datasets: rawDatasets, dualAxis } = chartPayload;
    const multiMeasure = rawDatasets.length > 1;

    // ── PIE / DONUT ─────────────────────────────────────────
    if (w.type === 'pie') {
      const data = rawDatasets[0]?.data || [];
      const cfg: any = {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data,
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
      };
      this.charts.set(id, new Chart(canvas, cfg));
      return;
    }

    // ── LINE ────────────────────────────────────────────────
    if (w.type === 'line') {
      const cjsDatasets: ChartDataset<'line'>[] = rawDatasets.map(
        (ds: any, i: number) => ({
          label: ds.label,
          data: ds.data,
          borderColor: COLORS[i % COLORS.length],
          backgroundColor: COLORS[i % COLORS.length] + '18',
          tension: 0.4,
          fill: i === 0,
          pointRadius: 3,
          pointBackgroundColor: COLORS[i % COLORS.length],
          pointBorderColor: '#07080f',
          pointBorderWidth: 2,
          yAxisID: dualAxis ? (i === 0 ? 'y' : 'y1') : 'y',
        }),
      );

      const scales: any = {
        x: { grid: { color: '#252a3d' } },
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
      if (dualAxis) {
        scales['y1'] = {
          grid: { drawOnChartArea: false },
          position: 'right',
          title: {
            display: true,
            text: w.measures[1]?.label || '',
            color: COLORS[1],
            font: { size: 10 },
          },
        };
      }

      this.charts.set(
        id,
        new Chart(canvas, {
          type: 'line',
          data: { labels, datasets: cjsDatasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: multiMeasure,
                labels: { boxWidth: 10, padding: 10, font: { size: 10 } },
              },
            },
            scales,
          },
        }),
      );
      return;
    }

    // ── BAR (single or grouped) ──────────────────────────────
    const cjsDatasets: ChartDataset<'bar'>[] = rawDatasets.map(
      (ds: any, i: number) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: COLORS[i % COLORS.length] + 'cc',
        borderColor: COLORS[i % COLORS.length],
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
        yAxisID: dualAxis ? (i === 0 ? 'y' : 'y1') : 'y',
      }),
    );

    const scales: any = {
      x: { grid: { display: false } },
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
    if (dualAxis) {
      scales['y1'] = {
        grid: { drawOnChartArea: false },
        position: 'right',
        title: {
          display: true,
          text: w.measures[1]?.label || '',
          color: COLORS[1],
          font: { size: 10 },
        },
      };
    }

    this.charts.set(
      id,
      new Chart(canvas, {
        type: 'bar',
        data: { labels, datasets: cjsDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: multiMeasure,
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
          scales,
        },
      }),
    );
  }

  // ── KPI value ─────────────────────────────────────────────
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

  // ── Multi-measure summary for KPI widget ─────────────────
  getMsrSummary(
    w: WidgetConfig,
  ): { label: string; value: string; color: string }[] {
    if (!w.data?.rows?.length) return [];
    const totals = w.measures.map((m, i) => {
      const sum = w.data!.rows.reduce(
        (acc: number, r: any) => acc + (parseFloat(r[m.key]) || 0),
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
    return totals;
  }

  // ── Preset loader ─────────────────────────────────────────
  loadPresetIfAny() {
    const raw = sessionStorage.getItem('loadPreset');
    if (!raw) return;
    sessionStorage.removeItem('loadPreset');
    const preset = JSON.parse(raw);
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
        dimensions: dims,
        measures: msrs,
        span: 6,
      };
      this.widgets = [...this.widgets, w];
      this.runWidget(w);
    });
    this.showToast(`✓ "${preset.name}" loaded!`);
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => (this.toast = ''), 2800);
  }

  isMeasure(w: WidgetConfig, col: string): boolean {
    return !!w.measures?.some((m) => m.key === col);
  }
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
