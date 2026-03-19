import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-customer-segments-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Customer Segments" icon="people">
      <div class="chart-area">
        <canvas
          baseChart
          [data]="chartData"
          [options]="chartOptions"
          type="bar"
        ></canvas>
      </div>
      <div class="segment-list">
        <div class="segment-row" *ngFor="let s of segments">
          <span class="seg-dot" [style.background]="s.color"></span>
          <div class="seg-info">
            <span class="seg-name">{{ s.segment }}</span>
            <span class="seg-count">{{ s.count | number }} customers</span>
          </div>
          <div class="seg-metrics">
            <span class="seg-rev"
              >Rs. {{ s.revenue / 1000 | number: '1.0-0' }}K</span
            >
            <span class="seg-avg">Avg Rs. {{ s.avgSpend }}</span>
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .chart-area {
        height: 160px;
        position: relative;
        margin-bottom: 16px;
      }
      .segment-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .segment-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .seg-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .seg-info {
        flex: 1;
      }
      .seg-name {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #7c879b;
      }
      .seg-count {
        display: block;
        font-size: 11px;
        color: #8892a4;
        margin-top: 2px;
      }
      .seg-metrics {
        text-align: right;
      }
      .seg-rev {
        display: block;
        font-size: 13px;
        font-weight: 700;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
      }
      .seg-avg {
        display: block;
        font-size: 11px;
        color: #8892a4;
        margin-top: 2px;
      }
    `,
  ],
})
export class CustomerSegmentsWidgetComponent implements OnInit {
  segments: any[] = [];
  chartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c2235',
        titleColor: '#f0f2f8',
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
    this.analytics.getCustomerData().subscribe((data) => {
      this.segments = data.segments;
      this.chartData = {
        labels: data.segments.map((s: any) => s.segment),
        datasets: [
          {
            data: data.segments.map((s: any) => s.count),
            backgroundColor: data.segments.map((s: any) => s.color),
            borderRadius: 6,
            label: 'Customers',
          },
        ],
      };
    });
  }
}
