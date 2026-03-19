import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-customer-retention-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Customer Retention" icon="loyalty">
      <div class="retention-layout">
        <div class="retention-stat">
          <div class="stat-value">{{ latestRate }}%</div>
          <div class="stat-label">Current Retention Rate</div>
          <div class="trend trend-up">
            <span class="material-icons trend-icon">trending_up</span>
            +{{ trend }}% from last month
          </div>
        </div>
        <div class="retention-chart">
          <canvas
            baseChart
            [data]="chartData"
            [options]="chartOptions"
            type="line"
          ></canvas>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .retention-layout {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .retention-stat {
        text-align: center;
        padding: 12px;
        background: rgba(99, 102, 241, 0.08);
        border-radius: 12px;
      }
      .stat-value {
        font-size: 36px;
        font-weight: 800;
        color: #6366f1;
        font-family: 'JetBrains Mono', monospace;
      }
      .stat-label {
        font-size: 12px;
        color: #8892a4;
        margin-top: 4px;
      }
      .trend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;
        margin-top: 6px;
      }
      .trend-up {
        color: #10b981;
      }
      .trend-icon {
        font-size: 16px;
      }
      .retention-chart {
        height: 120px;
      }
    `,
  ],
})
export class CustomerRetentionWidgetComponent implements OnInit {
  latestRate = 0;
  trend = 0;
  chartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8892a4', font: { size: 10 } },
        border: { color: 'transparent' },
      },
      y: {
        min: 65,
        max: 85,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8892a4', font: { size: 10 } },
        border: { color: 'transparent' },
      },
    },
    elements: {
      line: { tension: 0.4, borderWidth: 2 },
      point: { radius: 3, backgroundColor: '#3b82f6' },
    },
  };

  constructor(private analytics: AnalyticsService) {}

  ngOnInit() {
    this.analytics.getCustomerData().subscribe((data) => {
      const rates = data.retention.rates;
      this.latestRate = rates[rates.length - 1];
      this.trend = +(this.latestRate - rates[rates.length - 2]).toFixed(1);
      this.chartData = {
        labels: data.retention.labels,
        datasets: [
          {
            data: rates,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            fill: true,
            label: 'Retention %',
          },
        ],
      };
    });
  }
}
