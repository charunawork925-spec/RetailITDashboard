import { Component, OnInit } from '@angular/core';
import { InsightMetrics, DailySalesData, RecentSalesPattern, ProfitabilityCategory, BestSellingProduct, StorePerformance } from '../../models/analytics';
import { AnalyticsService } from '../../services/analytics.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-insights.component',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,BaseChartDirective,SidebarComponent],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.css',
})
export class InsightsComponent implements OnInit {
 metrics?: InsightMetrics;
  dailySales?: DailySalesData;
  recentSalesPattern?: RecentSalesPattern;
  profitability: ProfitabilityCategory[] = [];
  bestSellingProducts: BestSellingProduct[] = [];
  storePerformances: StorePerformance[] = [];
  isLoading = true;

  Math = Math;

  // Daily Sales Chart
  dailySalesChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Actual Sales',
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
        borderWidth: 0,
        borderRadius: 6
      },
      {
        data: [],
        label: 'Target',
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
        borderWidth: 0,
        borderRadius: 6
      }
    ]
  };

  dailySalesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: 600 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // Recent Sales Pattern Chart
  recentSalesChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: '#10B981',
      borderColor: '#10B981',
      borderWidth: 0,
      borderRadius: 6
    }]
  };

  recentSalesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadInsightsData();
  }

  loadInsightsData(): void {
    this.isLoading = true;

    this.analyticsService.getCompleteAnalytics().subscribe({
      next: (data) => {
        this.metrics = data.insights.metrics;
        this.dailySales = data.insights.dailySales;
        this.recentSalesPattern = data.insights.recentSalesPattern;
        this.profitability = data.insights.profitability;
        this.bestSellingProducts = data.insights.bestSellingProducts;
        this.storePerformances = data.insights.storePerformances;

        // Setup daily sales chart
        if (this.dailySales) {
          this.dailySalesChartData.labels = this.dailySales.labels;
          this.dailySalesChartData.datasets[0].data = this.dailySales.actualSales;
          this.dailySalesChartData.datasets[1].data = this.dailySales.target;
        }

        // Setup recent sales pattern chart
        if (this.recentSalesPattern) {
          this.recentSalesChartData.labels = this.recentSalesPattern.labels;
          this.recentSalesChartData.datasets[0].data = this.recentSalesPattern.values;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading insights data:', error);
        this.isLoading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return `LKR ${(value / 1000).toFixed(1)}k`;
  }

  formatLargeCurrency(value: number): string {
    if (value >= 1000000) {
      return `LKR ${(value / 1000000).toFixed(2)}m`;
    }
    return `LKR ${(value / 1000).toFixed(0)}k`;
  }

  getChangeClass(change: number): string {
    return change >= 0 ? 'positive-change' : 'negative-change';
  }

  getPerformanceClass(performance: number): string {
    if (performance >= 100) return 'performance-excellent';
    if (performance >= 0) return 'performance-good';
    return 'performance-poor';
  }
}
