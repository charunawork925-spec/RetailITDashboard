import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import {
  Field,
  Dataset,
  ApiService,
  QueryRequest,
} from '../../../services/api.service';
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
}

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
  private charts: Map<string, Chart> = new Map();
  private idCounter = 0;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadPresetIfAny();
    this.api.getDatasets().subscribe({
      next: (d) => {
        this.datasets = d;
        this.filteredDatasets = d;
        if (d.length > 0) this.openDatasets.add(d[0].id);
        if (d.length > 1) this.openDatasets.add(d[1].id);
      },
    });
  }

  // ── Field Panel ───────────────────────────────────────
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

  typeClass(type: string) {
    return (
      { dim: 'ft-dim', msr: 'ft-msr', date: 'ft-date', bool: 'ft-bool' }[
        type
      ] || 'ft-dim'
    );
  }

  typeLabel(type: string) {
    return { dim: 'D', msr: 'M', date: 'T', bool: 'B' }[type] || 'D';
  }

  // ── Drag & Drop ───────────────────────────────────────
  onFieldDragStart(event: DragEvent, field: Field, dsId: string) {
    this.draggingField = { ...field, ds: dsId };
    event.dataTransfer!.effectAllowed = 'copy';
  }

  onFieldDragEnd() {
    this.draggingField = null;
  }

  onCanvasDrop(event: DragEvent) {
    event.preventDefault();
    if (!this.draggingField) return;
    const type = this.draggingField.type === 'msr' ? 'kpi' : 'bar';
    this.addWidget(type, this.draggingField);
  }

  onWidgetDrop(event: DragEvent, wid: string) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.draggingField) return;
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    if (this.draggingField.type === 'msr') {
      if (!w.measures.find((f) => f.key === this.draggingField!.key)) {
        w.measures = [...w.measures, { ...this.draggingField }];
        if (w.dataset === '') w.dataset = this.draggingField.ds;
      }
    } else {
      if (!w.dimensions.find((f) => f.key === this.draggingField!.key)) {
        w.dimensions = [...w.dimensions, { ...this.draggingField }];
        if (w.dataset === '') w.dataset = this.draggingField.ds;
      }
    }
    this.showToast('Field added!');
  }

  onAxisDrop(event: DragEvent, wid: string, axis: 'x' | 'y') {
    event.preventDefault();
    event.stopPropagation();
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
    this.renderConfigPanel(wid);
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  // ── Widgets ───────────────────────────────────────────
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
      title: hint ? hint.label : titles[type],
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
    const i = spans.indexOf(w.span);
    w.span = spans[(i + 1) % spans.length];
    setTimeout(() => this.renderChart(w.id), 80);
  }

  removeFieldFromWidget(wid: string, key: string, axis: 'x' | 'y') {
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    if (axis === 'x') w.dimensions = w.dimensions.filter((f) => f.key !== key);
    else w.measures = w.measures.filter((f) => f.key !== key);
    if (w.dimensions.length || w.measures.length) this.runWidget(w);
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
    if (w.dataset) setTimeout(() => this.runWidget(w), 80);
  }

  updateWidgetDataset(wid: string, dsId: string) {
    const w = this.widgets.find((x) => x.id === wid);
    if (!w) return;
    w.dataset = dsId;
    w.dimensions = [];
    w.measures = [];
  }

  renderConfigPanel(id: string) {
    this.selectedId = id;
  }

  // ── Query ─────────────────────────────────────────────
  runWidget(w: WidgetConfig) {
    if (!w.dataset || (!w.dimensions.length && !w.measures.length)) return;
    w.loading = true;
    w.error = undefined;
    const req: QueryRequest = {
      dataset: w.dataset,
      dimensions: w.dimensions.map((f) => f.key),
      measures: w.measures.map((f) => f.key),
      limit: w.type === 'grid' ? 100 : 20,
      order_dir: 'DESC',
    };
    if (w.measures.length) req.order_by = w.measures[0].key;
    this.api.query(req).subscribe({
      next: (res) => {
        w.loading = false;
        w.data = res;
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
      this.showToast('✓ All widgets refreshed!');
    }, 1200);
  }

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

    const rows = w.data.rows;
    const dimKey = w.dimensions[0]?.key;
    const msrKey = w.measures[0]?.key;
    const COLORS = [
      '#3b82f6',
      '#10b981',
      '#8b5cf6',
      '#f59e0b',
      '#06b6d4',
      '#ec4899',
      '#34d399',
      '#fbbf24',
    ];

    const labels = rows.map((r: any) =>
      dimKey ? String(r[dimKey] ?? '').substring(0, 22) : 'Value',
    );
    const data = rows.map((r: any) =>
      msrKey ? parseFloat(r[msrKey]) || 0 : 0,
    );

    let cfg: any;
    if (w.type === 'pie') {
      cfg = {
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
    } else if (w.type === 'line') {
      cfg = {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: msrKey || '',
              data,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.08)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#07080f',
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: '#252a3d' } },
            y: { grid: { color: '#252a3d' } },
          },
        },
      };
    } else {
      cfg = {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: msrKey || '',
              data,
              backgroundColor: COLORS.map((c) => c + 'cc'),
              borderRadius: 5,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#252a3d' } },
          },
        },
      };
    }
    this.charts.set(id, new Chart(canvas, cfg));
  }

  getKpiValue(w: WidgetConfig): string {
    if (!w.data?.rows?.length) return '—';
    const r = w.data.rows[0];
    const key = w.measures[0]?.key;
    const v = key ? r[key] : null;
    if (v === null || v === undefined) return '—';
    const n = parseFloat(v);
    if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(1)}K`;
    return String(v);
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => (this.toast = ''), 2800);
  }

  getSpanClass(span: number): string {
    return 'span-' + span;
  }

  getDsLabel(dsId: string): string {
    return this.datasets.find((d) => d.id === dsId)?.label || '—';
  }

  trackById(_: number, w: WidgetConfig) {
    return w.id;
  }

  loadPresetIfAny() {
    const raw = sessionStorage.getItem('loadPreset');
    if (!raw) return;
    sessionStorage.removeItem('loadPreset');
    const preset = JSON.parse(raw);
    // Wait for datasets to load, then build widgets
    const interval = setInterval(() => {
      if (!this.datasets.length) return;
      clearInterval(interval);
      preset.widgets.forEach((wCfg: any) => {
        const id = 'w' + ++this.idCounter;
        // Resolve field objects from dataset metadata
        const ds = this.datasets.find((d: any) => d.id === wCfg.dataset);
        const dims = wCfg.dimensions
          .map((key: string) => ds?.fields.find((f: any) => f.key === key))
          .filter(Boolean);
        const msrs = wCfg.measures
          .map((key: string) => ds?.fields.find((f: any) => f.key === key))
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
      this.showToast('✓ Preset "' + preset.name + '" loaded!');
    }, 200);
  }

  isMeasure(w: WidgetConfig, col: string): boolean {
    return !!w.measures?.some((m) => m.key === col);
  }
}
