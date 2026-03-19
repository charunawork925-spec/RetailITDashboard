import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-payment-methods-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Payment Split" icon="payment">
      <div class="payment-layout">
        <div class="donut-wrap">
          <canvas
            baseChart
            [data]="chartData"
            [options]="chartOptions"
            type="doughnut"
          ></canvas>
        </div>
        <div class="legend">
          <div class="legend-item" *ngFor="let p of data">
            <span class="legend-dot" [style.background]="p.color"></span>
            <span class="legend-label">{{ p.method }}</span>
            <span class="legend-pct">{{ p.percentage }}%</span>
          </div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .payment-layout {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .donut-wrap {
        width: 100px;
        height: 100px;
        flex-shrink: 0;
      }
      .legend {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .legend-label {
        font-size: 12px;
        color: #8892a4;
        flex: 1;
      }
      .legend-pct {
        font-size: 13px;
        font-weight: 700;
        color: #7c879b;
      }
    `,
  ],
})
export class PaymentMethodsWidgetComponent implements OnChanges {
  @Input() data: any[] = [];

  chartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [],
  };
  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
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

  ngOnChanges() {
    if (!this.data?.length) return;
    this.chartData = {
      labels: this.data.map((p) => p.method),
      datasets: [
        {
          data: this.data.map((p) => p.percentage),
          backgroundColor: this.data.map((p) => p.color),
          borderWidth: 0,
          hoverBorderWidth: 0,
        },
      ],
    };
  }
}
