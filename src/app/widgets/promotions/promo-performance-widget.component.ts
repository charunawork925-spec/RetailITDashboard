import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-promo-performance-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Promo Performance" icon="bar_chart">
      <div class="chart-container" style="height:200px;">
        <canvas
          baseChart
          [data]="chartData"
          [options]="chartOptions"
          type="bar"
        ></canvas>
      </div>
    </app-widget-wrapper>
  `,
  styles: [``],
})
export class PromoPerformanceWidgetComponent implements OnInit {
  chartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#8892a4', font: { size: 11 } },
        position: 'top',
      },
      tooltip: {
        backgroundColor: '#1c2235',
        titleColor: '#7c879b8',
        bodyColor: '#8892a4',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8892a4', font: { size: 11 } },
        border: { color: 'transparent' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8892a4', font: { size: 11 } },
        border: { color: 'transparent' },
      },
    },
  };

  constructor(private analytics: AnalyticsService) {}

  ngOnInit() {
    this.analytics.getPromotionData().subscribe((d) => {
      this.chartData = {
        labels: d.performance.labels,
        datasets: [
          {
            data: d.performance.redemptions,
            label: 'Redemptions',
            backgroundColor: 'rgba(99,102,241,0.7)',
            borderRadius: 4,
          },
          {
            data: d.performance.revenue.map((v: number) => v / 100),
            label: 'Revenue (×100)',
            backgroundColor: 'rgba(16,185,129,0.7)',
            borderRadius: 4,
          },
        ],
      };
    });
  }
}
