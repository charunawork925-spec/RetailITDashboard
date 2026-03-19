// components/widgets/chart-widget/chart-widget.component.ts
import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule,MatIconModule],
  template: `
    <div class="chart-widget">
      <div *ngIf="!chartData || !chartData.labels || chartData.labels.length === 0" class="no-data">
        <mat-icon>bar_chart</mat-icon>
        <p>No chart data available</p>
      </div>
      
      <div *ngIf="chartData && chartData.labels && chartData.labels.length > 0" class="chart-container">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-widget {
      height: 100%;
      position: relative;
    }
    .chart-container {
      height: 100%;
      width: 100%;
    }
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
    }
    .no-data mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }
  `]
})
export class ChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget: any = {};
  @Input() data: any = {};
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  
  private chart: Chart | null = null;
  public chartData: any = { labels: [], values: [] };

  ngOnInit(): void {
    // Register Chart.js components
    Chart.register(...registerables);
    
    // Initialize chart data
    this.chartData = this.data || { labels: [], values: [] };
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderChart(), 100);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private renderChart(): void {
    if (!this.chartCanvas?.nativeElement || 
        !this.chartData?.labels || 
        this.chartData.labels.length === 0) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    const chartType = this.widget?.config?.chartType || 'line';
    const colors = this.getChartColors();

    const config: ChartConfiguration = {
      type: chartType,
      data: {
        labels: this.chartData.labels,
        datasets: [{
          label: this.widget?.title || 'Data',
          data: this.chartData.values,
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor,
          borderWidth: 2,
          fill: chartType === 'line' ? true : false,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: chartType !== 'pie' && chartType !== 'doughnut',
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          }
        } : undefined
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private getChartColors(): { borderColor: string; backgroundColor: string } {
    const colorSchemes = [
      { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
      { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
      { borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)' },
      { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)' }
    ];
    
    const index = Math.abs(this.hashCode(this.widget?.id || 'default')) % colorSchemes.length;
    return colorSchemes[index];
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}