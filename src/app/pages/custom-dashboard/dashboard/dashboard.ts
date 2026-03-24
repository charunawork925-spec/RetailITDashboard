import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  viewChild,
} from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../../../services/api.service';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  kpis: any = {};
  charts: any = {};
  top10: any[] = [];
  loading = true;
  chartsLoaded = false;

  private chartInstances: Chart[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getKpis().subscribe({
      next: (d) => {
        this.kpis = d;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.api
      .getTop10()
      .subscribe({ next: (d) => (this.top10 = d), error: () => {} });
    this.api.getDashboardCharts().subscribe({
      next: (d) => {
        this.charts = d;
        this.chartsLoaded = true;
        setTimeout(() => this.buildCharts(), 100);
      },
      error: () => {},
    });
  }

  ngAfterViewInit() {}

  fmtLkr(v: number): string {
    if (!v) return 'LKR 0';
    if (v >= 1_000_000) return `LKR ${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `LKR ${(v / 1_000).toFixed(0)}K`;
    return `LKR ${v.toFixed(0)}`;
  }

  fmtNum(v: number): string {
    if (!v) return '0';
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return `${v}`;
  }

  getTrendWidth(rev: number): string {
    const max = this.top10[0]?.revenue_ytd || 1;
    return Math.round((rev / max) * 100) + '%';
  }

  buildCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = '#252a3d';
    Chart.defaults.font.family = 'Outfit';
    Chart.defaults.font.size = 11;

    this.chartInstances.forEach((c) => c.destroy());
    this.chartInstances = [];

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

    const monthly = document.getElementById(
      'chartMonthly',
    ) as HTMLCanvasElement;
    if (monthly && this.charts.monthly_revenue) {
      this.chartInstances.push(
        new Chart(monthly, {
          type: 'line',
          data: {
            labels: this.charts.monthly_revenue.labels,
            datasets: [
              {
                label: 'Revenue',
                data: this.charts.monthly_revenue.data,
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
              y: {
                grid: { color: '#252a3d' },
                ticks: {
                  callback: (v: any) => 'LKR ' + (v / 1000).toFixed(0) + 'K',
                },
              },
            },
          },
        }),
      );
    }

    const catCanvas = document.getElementById(
      'chartCategory',
    ) as HTMLCanvasElement;
    if (catCanvas && this.charts.category_revenue) {
      this.chartInstances.push(
        new Chart(catCanvas, {
          type: 'doughnut',
          data: {
            labels: this.charts.category_revenue.labels,
            datasets: [
              {
                data: this.charts.category_revenue.data,
                backgroundColor: COLORS,
                borderWidth: 2,
                borderColor: '#13161f',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: {
                position: 'right',
                labels: { boxWidth: 10, padding: 12, font: { size: 11 } },
              },
            },
          },
        }),
      );
    }

    const branchCanvas = document.getElementById(
      'chartBranch',
    ) as HTMLCanvasElement;
    if (branchCanvas && this.charts.branch_revenue) {
      const shortLabels = this.charts.branch_revenue.labels.map((l: string) =>
        l.replace('FreshMart ', ''),
      );
      this.chartInstances.push(
        new Chart(branchCanvas, {
          type: 'bar',
          data: {
            labels: shortLabels,
            datasets: [
              {
                label: 'Revenue',
                data: this.charts.branch_revenue.data,
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
              y: {
                grid: { color: '#252a3d' },
                ticks: {
                  callback: (v: any) => 'LKR ' + (v / 1000).toFixed(0) + 'K',
                },
              },
            },
          },
        }),
      );
    }

    const loyaltyCanvas = document.getElementById(
      'chartLoyalty',
    ) as HTMLCanvasElement;
    if (loyaltyCanvas && this.charts.loyalty_cart) {
      this.chartInstances.push(
        new Chart(loyaltyCanvas, {
          type: 'bar',
          data: {
            labels: this.charts.loyalty_cart.labels,
            datasets: [
              {
                label: 'Avg Cart (LKR)',
                data: this.charts.loyalty_cart.data,
                backgroundColor: [
                  '#f59e0b',
                  '#94a3b8cc',
                  '#b87c3ccc',
                  '#4b5875cc',
                ],
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
        }),
      );
    }

    const halalCanvas = document.getElementById(
      'chartHalal',
    ) as HTMLCanvasElement;
    if (halalCanvas && this.charts.halal_by_area) {
      this.chartInstances.push(
        new Chart(halalCanvas, {
          type: 'bar',
          data: {
            labels: this.charts.halal_by_area.labels,
            datasets: [
              {
                label: 'Halal',
                data: this.charts.halal_by_area.halal,
                backgroundColor: 'rgba(16,185,129,0.8)',
                borderRadius: 4,
                borderSkipped: false,
              },
              {
                label: 'Non-Halal',
                data: this.charts.halal_by_area.non_halal,
                backgroundColor: 'rgba(59,130,246,0.5)',
                borderRadius: 4,
                borderSkipped: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { stacked: true, grid: { display: false } },
              y: { stacked: true, grid: { color: '#252a3d' } },
            },
            plugins: { legend: { labels: { boxWidth: 10, padding: 12 } } },
          },
        }),
      );
    }
  }
}
