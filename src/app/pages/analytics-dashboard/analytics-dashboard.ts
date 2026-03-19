import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Subscription, interval } from 'rxjs';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { NgxGaugeModule } from 'ngx-gauge';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

// Chart.js plugins
import { 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import Chart from 'chart.js/auto';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
);

// Dashboard widget types
type WidgetType = 'line' | 'bar' | 'pie' | 'radar' | 'doughnut' | 'gauge' | 'kpi' | 'table' | 'metric';
type WidgetSize = 'small' | 'medium' | 'large';
type DashboardCategory = 'customer' | 'inventory' | 'sales' | 'profitability' | 'wastage' | 'promotion' | 'overview';
type Severity = 'info' | 'success' | 'warning' | 'error';

interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  size: WidgetSize;
  category: DashboardCategory;
  subTopic: string;
  dataSource: string;
  refreshInterval: number;
  position: { x: number; y: number; cols: number; rows: number };
  config: any;
  lastUpdated: Date;
  selected: boolean;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  status: 'exceeded' | 'met' | 'below' | 'critical';
  color: 'primary' | 'accent' | 'warn';
}

interface CategoryConfig {
  id: DashboardCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
  subTopics: string[];
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTooltipModule,
    BaseChartDirective,
    NgxGaugeModule,
    SidebarComponent
  ],
  templateUrl: './analytics-dashboard.html',
  styleUrls: ['./analytics-dashboard.css']
})
export class AnalyticsDashboard implements OnInit, OnDestroy {
  // Layout configuration
  gridColumns = 12;
  rowHeight = 80;
  widgetGap = 16;
  
  // Dashboard state
  selectedTimeFrame: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom' = 'week';
  selectedCategories: DashboardCategory[] = ['overview'];
  selectedSubTopics: string[] = [];
  controlPanelExpanded: boolean = false;
  
  dateRange = {
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  };
  
  // Data
  kpis: KPI[] = [];
  
  // Widgets
  availableWidgets: DashboardWidget[] = [];
  activeWidgets: DashboardWidget[] = [];
  filteredWidgets: DashboardWidget[] = [];
  
  // Categories configuration
  categories: CategoryConfig[] = [
    {
      id: 'overview',
      name: 'Overview',
      icon: 'dashboard',
      color: '#3f51b5',
      description: 'High-level business metrics',
      subTopics: ['Summary', 'Performance', 'Trends']
    },
    {
      id: 'customer',
      name: 'Customer',
      icon: 'people',
      color: '#4caf50',
      description: 'Customer analytics and insights',
      subTopics: [
        'Total Customers',
        'New Customers',
        'Active vs Inactive',
        'Top Customers',
        'Purchase Frequency',
        'Average Spend',
        'Retention Rate',
        'Credit Balances',
        'Credit Utilization'
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: 'inventory',
      color: '#ff9800',
      description: 'Stock management and tracking',
      subTopics: [
        'Stock Value',
        'Available Stock',
        'Out of Stock',
        'Low Stock',
        'Overstock',
        'Turnover Ratio',
        'Days in Inventory',
        'Goods Received',
        'Goods Issued',
        'Fast Moving Items'
      ]
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: 'shopping_cart',
      color: '#9c27b0',
      description: 'Sales performance and trends',
      subTopics: [
        'Total Sales',
        'Sales Growth',
        'Product Performance',
        'Regional Sales',
        'Channel Performance',
        'Sales vs Target',
        'Average Transaction',
        'Sales per Customer'
      ]
    },
    {
      id: 'profitability',
      name: 'Profitability',
      icon: 'trending_up',
      color: '#2196f3',
      description: 'Profit margins and financial health',
      subTopics: [
        'Gross Profit',
        'Net Profit',
        'Profit Margins',
        'Cost Analysis',
        'Revenue Streams',
        'ROI',
        'Break-even Analysis',
        'Product Profitability'
      ]
    },
    {
      id: 'wastage',
      name: 'Wastage',
      icon: 'delete',
      color: '#f44336',
      description: 'Waste management and reduction',
      subTopics: [
        'Total Wastage',
        'Waste by Category',
        'Expired Stock',
        'Damaged Goods',
        'Waste Trends',
        'Cost of Wastage',
        'Waste Reduction',
        'Waste by Department'
      ]
    },
    {
      id: 'promotion',
      name: 'Promotion',
      icon: 'local_offer',
      color: '#00bcd4',
      description: 'Promotional campaign analytics',
      subTopics: [
        'Active Promotions',
        'Sales Contribution',
        'Promotion Success',
        'Promotion vs Regular',
        'Redemption Trends',
        'Top Promoted Products',
        'Branch Performance'
      ]
    }
  ];

  // Chart configurations
  public customerGrowthChart: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Total Customers',
          data: [120, 135, 148, 162, 175, 190, 205, 220, 235, 250, 265, 280],
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'New Customers',
          data: [15, 18, 22, 25, 20, 28, 32, 30, 35, 28, 25, 30],
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      }
    }
  };

  public topCustomersChart: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Customer A', 'Customer B', 'Customer C', 'Customer D', 'Customer E'],
      datasets: [{
        label: 'Revenue ($)',
        data: [125000, 98000, 87500, 76000, 68000],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#3f51b5'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      }
    }
  };

  public inventoryTurnoverChart: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Turnover Ratio',
          data: [4.2, 4.5, 4.8, 5.1],
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Turnover Ratio'
          }
        }
      }
    }
  };

  public stockLevelChart: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse D'],
      datasets: [
        {
          label: 'Current Stock',
          data: [450, 320, 280, 390],
          backgroundColor: '#2196f3'
        },
        {
          label: 'Reorder Level',
          data: [100, 100, 100, 100],
          backgroundColor: '#f44336',
          type: 'line',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      }
    }
  };

  public salesPerformanceChart: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Actual Sales',
          data: [12000, 15000, 14000, 18000, 22000, 25000, 20000],
          borderColor: '#9c27b0',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          fill: true
        },
        {
          label: 'Target',
          data: [15000, 15000, 15000, 15000, 20000, 20000, 20000],
          borderColor: '#ff9800',
          borderDash: [5, 5],
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      }
    }
  };

  public profitabilityChart: ChartConfiguration = {
    type: 'radar',
    data: {
      labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
      datasets: [
        {
          label: 'Gross Margin %',
          data: [35, 42, 28, 45, 38],
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: '#2196f3',
          pointBackgroundColor: '#2196f3'
        },
        {
          label: 'Net Margin %',
          data: [22, 28, 18, 30, 24],
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderColor: '#4caf50',
          pointBackgroundColor: '#4caf50'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 50
        }
      }
    }
  };

  public wastageChart: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: ['Expired', 'Damaged', 'Spillage', 'Production', 'Other'],
      datasets: [{
        data: [45, 25, 15, 10, 5],
        backgroundColor: ['#f44336', '#ff9800', '#9c27b0', '#3f51b5', '#607d8b'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' }
      }
    }
  };

  public promotionPerformanceChart: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Promo 1', 'Promo 2', 'Promo 3', 'Promo 4', 'Promo 5'],
      datasets: [
        {
          label: 'Sales During Promotion',
          data: [25000, 32000, 28000, 41000, 36000],
          backgroundColor: '#00bcd4'
        },
        {
          label: 'Regular Sales',
          data: [18000, 22000, 19000, 24000, 21000],
          backgroundColor: '#9e9e9e'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      }
    }
  };

  // Subscriptions
  private subscriptions = new Subscription();
  private refreshInterval = interval(30000);

  constructor() {
    this.initializeWidgets();
  }

  ngOnInit() {
    this.initializeDashboard();
    this.startRealTimeUpdates();
  }

  initializeDashboard() {
    this.generateKPIs();
    this.filterWidgets();
  }

  initializeWidgets() {
    // Customer Analytics Widgets
    this.availableWidgets = [
      // Customer widgets
      {
        id: 'total-customers',
        title: 'Total Customers',
        type: 'metric',
        size: 'small',
        category: 'customer',
        subTopic: 'Total Customers',
        dataSource: 'customer_api',
        refreshInterval: 60000,
        position: { x: 0, y: 0, cols: 3, rows: 2 },
        config: { value: 1245, unit: '', trend: 'up', change: 4.2 },
        lastUpdated: new Date(),
        selected: true
      },
      {
        id: 'customer-growth',
        title: 'Customer Growth Trend',
        type: 'line',
        size: 'medium',
        category: 'customer',
        subTopic: 'Total Customers',
        dataSource: 'customer_api',
        refreshInterval: 30000,
        position: { x: 3, y: 0, cols: 4, rows: 3 },
        config: this.customerGrowthChart,
        lastUpdated: new Date(),
        selected: true
      },
      {
        id: 'top-customers',
        title: 'Top Customers by Revenue',
        type: 'bar',
        size: 'medium',
        category: 'customer',
        subTopic: 'Top Customers',
        dataSource: 'customer_api',
        refreshInterval: 60000,
        position: { x: 7, y: 0, cols: 5, rows: 3 },
        config: this.topCustomersChart,
        lastUpdated: new Date(),
        selected: true
      },
      {
        id: 'customer-segmentation',
        title: 'Customer Segmentation',
        type: 'pie',
        size: 'small',
        category: 'customer',
        subTopic: 'Active vs Inactive',
        dataSource: 'customer_api',
        refreshInterval: 45000,
        position: { x: 0, y: 2, cols: 3, rows: 2 },
        config: {
          data: {
            labels: ['Retail', 'Wholesale', 'Loyalty', 'New'],
            datasets: [{
              data: [45, 30, 20, 5],
              backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0']
            }]
          }
        },
        lastUpdated: new Date(),
        selected: true
      },
      {
        id: 'purchase-frequency',
        title: 'Purchase Frequency',
        type: 'gauge',
        size: 'small',
        category: 'customer',
        subTopic: 'Purchase Frequency',
        dataSource: 'customer_api',
        refreshInterval: 30000,
        position: { x: 0, y: 4, cols: 3, rows: 2 },
        config: { value: 2.8, unit: 'times/month', min: 0, max: 5 },
        lastUpdated: new Date(),
        selected: true
      },

      // Inventory widgets
      {
        id: 'stock-value',
        title: 'Total Stock Value',
        type: 'metric',
        size: 'small',
        category: 'inventory',
        subTopic: 'Stock Value',
        dataSource: 'inventory_api',
        refreshInterval: 30000,
        position: { x: 0, y: 6, cols: 3, rows: 2 },
        config: { value: 1250000, unit: '$', trend: 'down', change: -2.3 },
        lastUpdated: new Date(),
        selected: false
      },
      {
        id: 'inventory-turnover',
        title: 'Inventory Turnover Ratio',
        type: 'line',
        size: 'medium',
        category: 'inventory',
        subTopic: 'Turnover Ratio',
        dataSource: 'inventory_api',
        refreshInterval: 60000,
        position: { x: 3, y: 3, cols: 4, rows: 3 },
        config: this.inventoryTurnoverChart,
        lastUpdated: new Date(),
        selected: false
      },
      {
        id: 'stock-levels',
        title: 'Stock Levels by Warehouse',
        type: 'bar',
        size: 'medium',
        category: 'inventory',
        subTopic: 'Available Stock',
        dataSource: 'inventory_api',
        refreshInterval: 30000,
        position: { x: 7, y: 3, cols: 5, rows: 3 },
        config: this.stockLevelChart,
        lastUpdated: new Date(),
        selected: false
      },
      {
        id: 'fast-moving',
        title: 'Top 10 Fast Moving Items',
        type: 'table',
        size: 'medium',
        category: 'inventory',
        subTopic: 'Fast Moving Items',
        dataSource: 'inventory_api',
        refreshInterval: 60000,
        position: { x: 0, y: 8, cols: 6, rows: 3 },
        config: {},
        lastUpdated: new Date(),
        selected: false
      },
      {
        id: 'low-stock',
        title: 'Low Stock Alerts',
        type: 'table',
        size: 'small',
        category: 'inventory',
        subTopic: 'Low Stock',
        dataSource: 'inventory_api',
        refreshInterval: 30000,
        position: { x: 6, y: 8, cols: 6, rows: 2 },
        config: {},
        lastUpdated: new Date(),
        selected: false
      },

      // Sales widgets
      {
        id: 'sales-performance',
        title: 'Sales Performance',
        type: 'line',
        size: 'medium',
        category: 'sales',
        subTopic: 'Total Sales',
        dataSource: 'sales_api',
        refreshInterval: 30000,
        position: { x: 0, y: 11, cols: 6, rows: 3 },
        config: this.salesPerformanceChart,
        lastUpdated: new Date(),
        selected: false
      },
      {
        id: 'sales-by-product',
        title: 'Sales by Product Category',
        type: 'doughnut',
        size: 'small',
        category: 'sales',
        subTopic: 'Product Performance',
        dataSource: 'sales_api',
        refreshInterval: 45000,
        position: { x: 6, y: 10, cols: 3, rows: 2 },
        config: {},
        lastUpdated: new Date(),
        selected: false
      },
      {
        id: 'regional-sales',
        title: 'Regional Sales Distribution',
        type: 'bar',
        size: 'medium',
        category: 'sales',
        subTopic: 'Regional Sales',
        dataSource: 'sales_api',
        refreshInterval: 60000,
        position: { x: 0, y: 14, cols: 6, rows: 3 },
        config: {},
        lastUpdated: new Date(),
        selected: false
      },

      // Profitability widgets
      {
        id: 'profit-margin',
        title: 'Profit Margins',
        type: 'radar',
        size: 'medium',
        category: 'profitability',
        subTopic: 'Profit Margins',
        dataSource: 'finance_api',
        refreshInterval: 60000,
        position: { x: 6, y: 12, cols: 6, rows: 3 },
        config: this.profitabilityChart,
        lastUpdated: new Date(),
        selected: false
      },
      {
        id: 'cost-analysis',
        title: 'Cost Breakdown',
        type: 'pie',
        size: 'small',
        category: 'profitability',
        subTopic: 'Cost Analysis',
        dataSource: 'finance_api',
        refreshInterval: 45000,
        position: { x: 0, y: 17, cols: 3, rows: 2 },
        config: {},
        lastUpdated: new Date(),
        selected: false
      },

      // Wastage widgets
      {
        id: 'wastage-analysis',
        title: 'Wastage Analysis',
        type: 'pie',
        size: 'medium',
        category: 'wastage',
        subTopic: 'Total Wastage',
        dataSource: 'inventory_api',
        refreshInterval: 60000,
        position: { x: 3, y: 19, cols: 4, rows: 3 },
        config: this.wastageChart,
        lastUpdated: new Date(),
        selected: false
      },
      {
        id: 'waste-trend',
        title: 'Wastage Trend',
        type: 'line',
        size: 'small',
        category: 'wastage',
        subTopic: 'Waste Trends',
        dataSource: 'inventory_api',
        refreshInterval: 30000,
        position: { x: 7, y: 19, cols: 5, rows: 2 },
        config: {},
        lastUpdated: new Date(),
        selected: false
      },

      // Promotion widgets
      {
        id: 'promotion-performance',
        title: 'Promotion Performance',
        type: 'bar',
        size: 'medium',
        category: 'promotion',
        subTopic: 'Promotion Success',
        dataSource: 'sales_api',
        refreshInterval: 60000,
        position: { x: 0, y: 22, cols: 6, rows: 3 },
        config: this.promotionPerformanceChart,
        lastUpdated: new Date(),
        selected: false
      },
      {
        id: 'promotion-contribution',
        title: 'Promotion Sales Contribution',
        type: 'metric',
        size: 'small',
        category: 'promotion',
        subTopic: 'Sales Contribution',
        dataSource: 'sales_api',
        refreshInterval: 30000,
        position: { x: 6, y: 22, cols: 3, rows: 2 },
        config: { value: 28, unit: '%', trend: 'up', change: 3.5 },
        lastUpdated: new Date(),
        selected: false
      }
    ];

    // Initially select only overview widgets
    this.activeWidgets = this.availableWidgets.filter(w => w.selected);
    this.updateWidgetPositions();
  }

  generateKPIs() {
    this.kpis = [
      {
        id: 'total-customers',
        name: 'Total Customers',
        value: 1245,
        previousValue: 1200,
        target: 1300,
        unit: '',
        trend: 'up',
        changePercentage: 3.75,
        status: 'met',
        color: 'primary'
      },
      {
        id: 'inventory-value',
        name: 'Inventory Value',
        value: 1250000,
        previousValue: 1280000,
        target: 1200000,
        unit: '$',
        trend: 'down',
        changePercentage: -2.34,
        status: 'below',
        color: 'warn'
      },
      {
        id: 'monthly-sales',
        name: 'Monthly Sales',
        value: 450000,
        previousValue: 420000,
        target: 400000,
        unit: '$',
        trend: 'up',
        changePercentage: 7.14,
        status: 'exceeded',
        color: 'accent'
      },
      {
        id: 'profit-margin',
        name: 'Profit Margin',
        value: 24.5,
        previousValue: 22.8,
        target: 25,
        unit: '%',
        trend: 'up',
        changePercentage: 7.46,
        status: 'met',
        color: 'primary'
      }
    ];
  }

  filterWidgets() {
    if (this.selectedCategories.length === 0) {
      this.filteredWidgets = [...this.availableWidgets];
    } else {
      this.filteredWidgets = this.availableWidgets.filter(widget => 
        this.selectedCategories.includes(widget.category)
      );
    }
  }

  toggleCategory(category: DashboardCategory) {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.filterWidgets();
    this.updateActiveWidgets();
  }

  updateActiveWidgets() {
    this.activeWidgets = this.availableWidgets.filter(widget => 
      this.selectedCategories.includes(widget.category) && widget.selected
    );
    this.updateWidgetPositions();
  }

  toggleWidgetSelection(widget: DashboardWidget) {
    widget.selected = !widget.selected;
    this.updateActiveWidgets();
  }

  selectAllWidgets(category?: DashboardCategory) {
    const widgetsToUpdate = category 
      ? this.availableWidgets.filter(w => w.category === category)
      : this.availableWidgets;
    
    widgetsToUpdate.forEach(widget => widget.selected = true);
    this.updateActiveWidgets();
  }

  deselectAllWidgets(category?: DashboardCategory) {
    const widgetsToUpdate = category 
      ? this.availableWidgets.filter(w => w.category === category)
      : this.availableWidgets;
    
    widgetsToUpdate.forEach(widget => widget.selected = false);
    this.updateActiveWidgets();
  }

  updateWidgetPositions() {
    // Simple grid layout with responsive positioning
    const gridWidth = 12;
    let currentX = 0;
    let currentY = 0;
    let maxHeightInRow = 2;

    this.activeWidgets.forEach((widget, index) => {
      const cols = this.getWidgetCols(widget.size);
      const rows = this.getWidgetRows(widget.size);

      // Check if widget fits in current row
      if (currentX + cols > gridWidth) {
        currentX = 0;
        currentY += maxHeightInRow;
        maxHeightInRow = rows;
      }

      widget.position = {
        x: currentX,
        y: currentY,
        cols: cols,
        rows: rows
      };

      currentX += cols;
      maxHeightInRow = Math.max(maxHeightInRow, rows);

      // Add some spacing between widgets
      if (index < this.activeWidgets.length - 1) {
        const nextWidget = this.activeWidgets[index + 1];
        const nextCols = this.getWidgetCols(nextWidget.size);
        
        if (currentX + nextCols > gridWidth) {
          currentX = 0;
          currentY += maxHeightInRow;
          maxHeightInRow = 2;
        }
      }
    });
  }

  getWidgetCols(size: WidgetSize): number {
    switch(size) {
      case 'small': return 3;
      case 'medium': return 6;
      case 'large': return 12;
      default: return 4;
    }
  }

  getWidgetRows(size: WidgetSize): number {
    switch(size) {
      case 'small': return 2;
      case 'medium': return 3;
      case 'large': return 4;
      default: return 2;
    }
  }

  onWidgetDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateWidgetPositions();
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.updateActiveWidgets();
    }
  }

  onTimeFrameChange(timeFrame: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom') {
    this.selectedTimeFrame = timeFrame;
    
    switch(timeFrame) {
      case 'today':
        this.dateRange.start = new Date();
        this.dateRange.end = new Date();
        break;
      case 'week':
        this.dateRange.start = startOfWeek(new Date());
        this.dateRange.end = endOfWeek(new Date());
        break;
      case 'month':
        this.dateRange.start = startOfMonth(new Date());
        this.dateRange.end = endOfMonth(new Date());
        break;
      case 'quarter':
        const quarter = Math.floor(new Date().getMonth() / 3);
        this.dateRange.start = new Date(new Date().getFullYear(), quarter * 3, 1);
        this.dateRange.end = new Date(new Date().getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'year':
        this.dateRange.start = new Date(new Date().getFullYear(), 0, 1);
        this.dateRange.end = new Date(new Date().getFullYear(), 11, 31);
        break;
    }
    
    // Refresh data
    this.refreshDashboardData();
  }

  refreshDashboardData() {
    // Update all chart data
    this.updateChartData();
    
    // Update widget timestamps
    this.activeWidgets.forEach(widget => {
      widget.lastUpdated = new Date();
    });
  }

  updateChartData() {
    // Update chart data with realistic variations
    this.updateChartDataWithVariation(this.customerGrowthChart);
    this.updateChartDataWithVariation(this.topCustomersChart);
    this.updateChartDataWithVariation(this.inventoryTurnoverChart);
    this.updateChartDataWithVariation(this.stockLevelChart);
    this.updateChartDataWithVariation(this.salesPerformanceChart);
    this.updateChartDataWithVariation(this.profitabilityChart);
    this.updateChartDataWithVariation(this.wastageChart);
    this.updateChartDataWithVariation(this.promotionPerformanceChart);
  }

  updateChartDataWithVariation(chart: ChartConfiguration) {
    if (chart.data?.datasets) {
      chart.data.datasets.forEach(dataset => {
        if (Array.isArray(dataset.data)) {
          dataset.data = dataset.data.map(value => {
            const variation = (Math.random() - 0.5) * 0.05; // ±2.5%
            return typeof value === 'number' ? value * (1 + variation) : value;
          });
        }
      });
    }
  }

  startRealTimeUpdates() {
    this.subscriptions.add(
      this.refreshInterval.subscribe(() => {
        this.refreshDashboardData();
      })
    );
  }

  getCategoryColor(categoryId: DashboardCategory): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.color || '#666';
  }

  getCategoryIcon(categoryId: DashboardCategory): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.icon || 'widgets';
  }

  getWidgetIcon(widgetType: WidgetType): string {
    const icons: Record<WidgetType, string> = {
      line: 'show_chart',
      bar: 'bar_chart',
      pie: 'pie_chart',
      radar: 'radar',
      doughnut: 'donut_large',
      gauge: 'speed',
      kpi: 'assessment',
      table: 'table_chart',
      metric: 'analytics'
    };
    return icons[widgetType] || 'widgets';
  }

  exportDashboard(format: 'pdf' | 'excel' | 'image' = 'pdf') {
    console.log(`Exporting dashboard as ${format}...`);
    // Implement export logic
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getWidgetsCount(category: DashboardCategory): number {
    return this.availableWidgets.filter(w => w.category === category).length;
  }

  getActiveWidgetsCount(category: DashboardCategory): number {
    return this.availableWidgets.filter(w => w.category === category && w.selected).length;
  }
}
