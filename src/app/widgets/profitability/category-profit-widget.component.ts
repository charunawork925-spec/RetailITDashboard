import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-category-profit-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Category Profitability" icon="pie_chart">
      <div class="chart-wrap">
        <canvas
          baseChart
          [data]="chartData"
          [options]="chartOptions"
          type="bar"
        ></canvas>
      </div>
      <div class="category-list">
        <div class="cat-row" *ngFor="let c of data; let i = index">
          <div class="cat-rank">{{ i + 1 }}</div>
          <span class="cat-dot" [style.background]="c.color"></span>
          <span class="cat-name">{{ c.category }}</span>
          <div class="cat-bar-wrap">
            <div class="cat-bar-bg">
              <div
                class="cat-bar-fill"
                [style.background]="c.color"
                [style.width.%]="getBarWidth(c.grossProfit)"
              ></div>
            </div>
          </div>
          <span class="cat-val"
            >Rs. {{ c.grossProfit / 1000000 | number: '1.1-1' }}M</span
          >
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .chart-wrap {
        height: 200px;
        position: relative;
        margin-bottom: 16px;
      }
      .category-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .cat-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cat-rank {
        width: 18px;
        font-size: 11px;
        font-weight: 800;
        color: #4f5b6e;
        text-align: center;
        flex-shrink: 0;
      }
      .cat-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .cat-name {
        font-size: 12px;
        color: #8892a4;
        width: 110px;
        flex-shrink: 0;
      }
      .cat-bar-wrap {
        flex: 1;
      }
      .cat-bar-bg {
        height: 6px;
        background: rgba(255, 255, 255, 0.07);
        border-radius: 3px;
        overflow: hidden;
      }
      .cat-bar-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 1s ease;
      }
      .cat-val {
        font-size: 12px;
        font-weight: 700;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
        width: 70px;
        text-align: right;
        flex-shrink: 0;
      }
    `,
  ],
})
export class CategoryProfitWidgetComponent implements OnChanges {
  @Input() data: any[] = [];
  maxProfit = 0;

  chartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c2235',
        titleColor: '#f0f2f8',
        bodyColor: '#8892a4',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `Rs. ${((ctx.raw as number) / 1000000).toFixed(1)}M`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#8892a4',
          font: { size: 10 },
          callback: (v) => `${(Number(v) / 1000000).toFixed(0)}M`,
        },
        border: { color: 'transparent' },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#8892a4', font: { size: 11 } },
        border: { color: 'transparent' },
      },
    },
  };

  ngOnChanges() {
    if (!this.data?.length) return;
    this.maxProfit = Math.max(...this.data.map((d) => d.grossProfit));
    this.chartData = {
      labels: this.data.map((d) => d.category),
      datasets: [
        {
          data: this.data.map((d) => d.grossProfit),
          backgroundColor: this.data.map((d) => d.color),
          borderRadius: 4,
          label: 'Gross Profit',
        },
      ],
    };
  }

  getBarWidth(val: number): number {
    return this.maxProfit ? (val / this.maxProfit) * 100 : 0;
  }
}
