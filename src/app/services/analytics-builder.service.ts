// analytics-builder.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


type WidgetType = 'line' | 'bar' | 'pie' | 'radar' | 'doughnut' | 'gauge' | 'kpi' | 'table';
type WidgetSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  size: WidgetSize;
  dataSource: string;
  refreshInterval: number;
  position: { x: number; y: number; cols: number; rows: number };
  config: any;
  lastUpdated: Date;
}

export interface UserDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsTopic {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'inventory' | 'customers' | 'promotion' | 'profitability' | 'wastage';
  dataSource: string;
  availableWidgets: string[];
  defaultConfig?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsBuilderService {
  private availableTopics: AnalyticsTopic[] = [
    {
      id: 'sales-overview',
      name: 'Sales Overview',
      description: 'Daily, weekly, monthly sales metrics',
      category: 'sales',
      dataSource: 'sales',
      availableWidgets: ['metric', 'line-chart', 'bar-chart']
    },
    {
      id: 'customer-analytics',
      name: 'Customer Analytics',
      description: 'Customer behavior and segmentation',
      category: 'customers',
      dataSource: 'customers',
      availableWidgets: ['metric', 'pie-chart', 'table']
    },
    {
      id: 'inventory-status',
      name: 'Inventory Status',
      description: 'Stock levels and alerts',
      category: 'inventory',
      dataSource: 'inventory',
      availableWidgets: ['metric', 'gauge', 'list']
    },
    {
      id: 'promotion-effectiveness',
      name: 'Promotion Effectiveness',
      description: 'Promotion ROI and performance',
      category: 'promotion',
      dataSource: 'promotions',
      availableWidgets: ['metric', 'bar-chart', 'comparison-chart']
    },
    {
      id: 'profitability-analysis',
      name: 'Profitability Analysis',
      description: 'Profit margins by product/category',
      category: 'profitability',
      dataSource: 'profitability',
      availableWidgets: ['metric', 'donut-chart', 'tree-map']
    },
    {
      id: 'wastage-tracking',
      name: 'Wastage Tracking',
      description: 'Inventory wastage and loss',
      category: 'wastage',
      dataSource: 'wastage',
      availableWidgets: ['metric', 'line-chart', 'table']
    }
  ];

  private userDashboards: UserDashboard[] = [];
  private currentDashboard = new BehaviorSubject<UserDashboard | null>(null);

  constructor() {
    this.loadDashboards();
  }

  getAvailableTopics(): AnalyticsTopic[] {
    return this.availableTopics;
  }

  getTopicsByCategory(category: string): AnalyticsTopic[] {
    return this.availableTopics.filter(topic => topic.category === category);
  }

  createDashboard(name: string, description?: string): UserDashboard {
    const dashboard: UserDashboard = {
      id: this.generateId(),
      name,
      description,
      widgets: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.userDashboards.push(dashboard);
    this.saveDashboards();
    return dashboard;
  }

  addWidgetToDashboard(dashboardId: string, widget: DashboardWidget): void {
    const dashboard = this.userDashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      dashboard.widgets.push(widget);
      dashboard.updatedAt = new Date();
      this.saveDashboards();
    }
  }

  updateWidgetPosition(dashboardId: string, widgetId: string, position: any): void {
    const dashboard = this.userDashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      const widget = dashboard.widgets.find(w => w.id === widgetId);
      if (widget) {
        widget.position = position;
        dashboard.updatedAt = new Date();
        this.saveDashboards();
      }
    }
  }

  private saveDashboards(): void {
    localStorage.setItem('userDashboards', JSON.stringify(this.userDashboards));
  }

  private loadDashboards(): void {
    const saved = localStorage.getItem('userDashboards');
    if (saved) {
      this.userDashboards = JSON.parse(saved);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}