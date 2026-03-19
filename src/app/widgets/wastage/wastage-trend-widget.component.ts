import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-wastage-trend-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Weekly Wastage Trend" icon="timeline">
      <div class="kpi-row" *ngIf="summary">
        <div class="kpi">
          <span class="kpi-val">{{ summary.totalWastage }}</span>
          <span class="kpi-label">This Month</span>
        </div>
        <div class="kpi">
          <span class="kpi-val waste-pct">{{ summary.wastePercentage }}%</span>
          <span class="kpi-label">Waste Rate</span>
        </div>
        <div class="kpi">
          <span class="kpi-val good">{{ summary.trend }}%</span>
          <span class="kpi-label">Trend</span>
        </div>
      </div>
      <div style="height: 160px; margin-top: 12px;">
        <canvas
          baseChart
          [data]="chartData"
          [options]="chartOptions"
          type="bar"
        ></canvas>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .kpi-row {
        display: flex;
        gap: 12px;
      }
      .kpi {
        flex: 1;
        text-align: center;
        padding: 8px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
      }
      .kpi-val {
        display: block;
        font-size: 16px;
        font-weight: 800;
        color: #8892a4;
        font-family: 'JetBrains Mono', monospace;
      }
      .waste-pct {
        color: #f59e0b;
      }
      .good {
        color: #10b981;
      }
      .kpi-label {
        display: block;
        font-size: 10px;
        color: #8892a4;
        margin-top: 2px;
      }
    `,
  ],
})
export class WastageTrendWidgetComponent implements OnInit {
  summary: any;
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
    this.analytics.getWastageData().subscribe((d) => {
      this.summary = d.summary;
      this.chartData = {
        labels: d.weeklyTrend.labels,
        datasets: [
          {
            data: d.weeklyTrend.values,
            backgroundColor: d.weeklyTrend.values.map((v: number) =>
              v > 500 ? 'rgba(239,68,68,0.7)' : 'rgba(245,158,11,0.7)',
            ),
            borderRadius: 4,
            label: 'Wastage (Rs)',
          },
        ],
      };
    });
  }
}
