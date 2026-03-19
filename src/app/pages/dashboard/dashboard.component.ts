import { Component, OnInit } from '@angular/core';
import { DashboardMetrics, TopPerformingItem, TopCustomer, InventoryAlert, PaymentMethod, BranchSnapshot } from '../../models/analytics';
import { AnalyticsService } from '../../services/analytics.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

// Material Imports
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard.component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BaseChartDirective,
    SidebarComponent,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  metrics?: DashboardMetrics;
  topProducts: TopPerformingItem[] = [];
  topCustomers: TopCustomer[] = [];
  topBrands: TopCustomer[] = [];
  inventoryAlerts: InventoryAlert[] = [];
  paymentMethods: PaymentMethod[] = [];
  branches: BranchSnapshot[] = [];
  
  selectedView: 'today' | 'all' = 'today';
  isLoading = true;
  chartType: 'line' | 'bar' = 'line';

  // Sales Trend Chart Configuration
  salesTrendChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Sales',
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#4F46E5',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  };

  salesTrendChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 600 },
        bodyFont: { size: 13 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return `Sales: Rs. ${context.parsed.y!.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { 
          color: 'rgba(0, 0, 0, 0.05)',
          // drawBorder: false
        },
        ticks: { 
          font: { size: 11 },
          padding: 8,
          callback: function(value) {
            return 'Rs. ' + value;
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: { 
          font: { size: 11 },
          padding: 8
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    this.analyticsService.getCompleteAnalytics().subscribe({
      next: (data) => {
        this.metrics = data.dashboard.metrics;
        this.topProducts = data.dashboard.topProducts;
        this.topCustomers = data.dashboard.topCustomers;
        this.topBrands = data.dashboard.topBrands;
        this.inventoryAlerts = data.dashboard.inventoryAlerts;
        this.paymentMethods = data.dashboard.paymentMethods;
        this.branches = data.dashboard.branches;
        
        // Setup sales trend chart
        this.salesTrendChartData.labels = data.dashboard.salesTrend.labels;
        this.salesTrendChartData.datasets[0].data = data.dashboard.salesTrend.actualSales;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  toggleView(view: 'today' | 'all'): void {
    this.selectedView = view;
    // In production, you would fetch different data based on the view
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'critical': 'status-critical',
      'warning': 'status-warning',
      'low': 'status-low',
      'excellent': 'status-excellent',
      'good': 'status-good',
      'average': 'status-average',
      'poor': 'status-poor'
    };
    return statusMap[status] || '';
  }

  formatCurrency(value: number): string {
    return `Rs. ${value.toLocaleString()}`;
  }

  getChangeIcon(change: number): string {
    return change >= 0 ? 'trending_up' : 'trending_down';
  }

  getChangeClass(change: number): string {
    return change >= 0 ? 'positive-change' : 'negative-change';
  }

  readonly CIRCUMFERENCE = 502.65;

  getStrokeDashOffset(index: number): number {
    const previousPercentage = this.paymentMethods
      .slice(0, index)
      .reduce((sum, m) => sum + m.percentage, 0);

    return this.CIRCUMFERENCE - (previousPercentage * this.CIRCUMFERENCE) / 100;
  }
}