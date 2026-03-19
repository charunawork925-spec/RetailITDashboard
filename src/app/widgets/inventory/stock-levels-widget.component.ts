import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-stock-levels-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Stock Levels Overview" icon="inventory_2">
      <div class="stock-chart" style="height: 200px;">
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
export class StockLevelsWidgetComponent implements OnChanges {
  @Input() data: any[] = [];

  chartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c2235',
        titleColor: '#7c879b',
        bodyColor: '#8892a4',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        max: 100,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8892a4', font: { size: 11 } },
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
    const colors = this.data.map((d) => {
      if (d.status === 'critical') return '#ef4444';
      if (d.status === 'warning') return '#f59e0b';
      return '#3b82f6';
    });
    this.chartData = {
      labels: this.data.map((d) => d.productName),
      datasets: [
        {
          data: this.data.map((d) => d.percentage),
          backgroundColor: colors,
          borderRadius: 4,
          label: 'Stock %',
        },
      ],
    };
  }
}
