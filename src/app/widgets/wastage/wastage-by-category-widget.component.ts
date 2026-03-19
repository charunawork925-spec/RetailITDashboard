import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-wastage-by-category-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Wastage by Category" icon="donut_large">
      <div class="cat-layout">
        <div class="donut-area" style="height:160px;">
          <canvas
            baseChart
            [data]="chartData"
            [options]="chartOptions"
            type="doughnut"
          ></canvas>
        </div>
        <div class="cat-legend">
          <div class="cat-leg-item" *ngFor="let c of categories">
            <span class="cat-dot" [style.background]="c.color"></span>
            <span class="cat-name">{{ c.category }}</span>
            <span class="cat-amt">Rs. {{ c.amount }}</span>
            <span class="cat-pct">{{ c.percentage }}%</span>
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .cat-layout {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .cat-legend {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cat-leg-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
      }
      .cat-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .cat-name {
        font-size: 12px;
        color: #8892a4;
        flex: 1;
      }
      .cat-amt {
        font-size: 12px;
        font-weight: 700;
        color: #8892a4;
        font-family: 'JetBrains Mono', monospace;
      }
      .cat-pct {
        font-size: 11px;
        color: #4f5b6e;
        width: 32px;
        text-align: right;
      }
    `,
  ],
})
export class WastageByCategoryWidgetComponent implements OnInit {
  categories: any[] = [];
  chartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [],
  };
  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
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
  };

  constructor(private analytics: AnalyticsService) {}

  ngOnInit() {
    this.analytics.getWastageData().subscribe((d) => {
      this.categories = d.byCategory;
      this.chartData = {
        labels: d.byCategory.map((c: any) => c.category),
        datasets: [
          {
            data: d.byCategory.map((c: any) => c.percentage),
            backgroundColor: d.byCategory.map((c: any) => c.color),
            borderWidth: 0,
          },
        ],
      };
    });
  }
}
