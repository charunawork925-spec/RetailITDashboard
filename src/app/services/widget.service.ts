import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WidgetConfig, WidgetTopic } from '../models/analytics';

const DEFAULT_WIDGETS: WidgetConfig[] = [
  // Sales widgets
  { id: 'sales-metrics', title: 'Sales Metrics', topic: 'sales', component: 'SalesMetricsWidget', size: 'medium', visible: true, order: 0, icon: 'trending_up' },
  { id: 'sales-trend', title: 'Sales Trend', topic: 'sales', component: 'SalesTrendWidget', size: 'large', visible: true, order: 1, icon: 'show_chart' },
  { id: 'top-products', title: 'Top Products', topic: 'sales', component: 'TopProductsWidget', size: 'medium', visible: true, order: 2, icon: 'star' },
  { id: 'branch-performance', title: 'Branch Performance', topic: 'sales', component: 'BranchPerformanceWidget', size: 'large', visible: false, order: 3, icon: 'store' },
  { id: 'payment-methods', title: 'Payment Methods', topic: 'sales', component: 'PaymentMethodsWidget', size: 'small', visible: true, order: 4, icon: 'payment' },
  // Customer widgets
  { id: 'customer-segments', title: 'Customer Segments', topic: 'customer', component: 'CustomerSegmentsWidget', size: 'medium', visible: true, order: 5, icon: 'people' },
  { id: 'top-customers', title: 'Top Customers', topic: 'customer', component: 'TopCustomersWidget', size: 'medium', visible: true, order: 6, icon: 'person_pin' },
  { id: 'customer-retention', title: 'Customer Retention', topic: 'customer', component: 'CustomerRetentionWidget', size: 'medium', visible: false, order: 7, icon: 'loyalty' },
  { id: 'customer-satisfaction', title: 'Satisfaction Score', topic: 'customer', component: 'CustomerSatisfactionWidget', size: 'small', visible: true, order: 8, icon: 'sentiment_satisfied' },
  // Inventory widgets
  { id: 'inventory-alerts', title: 'Inventory Alerts', topic: 'inventory', component: 'InventoryAlertsWidget', size: 'medium', visible: true, order: 9, icon: 'warning' },
  { id: 'stock-levels', title: 'Stock Levels', topic: 'inventory', component: 'StockLevelsWidget', size: 'large', visible: false, order: 10, icon: 'inventory_2' },
  { id: 'top-brands', title: 'Top Brands', topic: 'inventory', component: 'TopBrandsWidget', size: 'small', visible: true, order: 11, icon: 'verified' },
  // Promotions widgets
  { id: 'active-promotions', title: 'Active Promotions', topic: 'promotions', component: 'ActivePromotionsWidget', size: 'large', visible: true, order: 12, icon: 'local_offer' },
  { id: 'promo-performance', title: 'Promo Performance', topic: 'promotions', component: 'PromoPerformanceWidget', size: 'medium', visible: false, order: 13, icon: 'bar_chart' },
  { id: 'promo-summary', title: 'Promotion Summary', topic: 'promotions', component: 'PromoSummaryWidget', size: 'small', visible: true, order: 14, icon: 'campaign' },
  // Profitability widgets
  { id: 'profit-overview', title: 'Profit Overview', topic: 'profitability', component: 'ProfitOverviewWidget', size: 'medium', visible: true, order: 15, icon: 'account_balance' },
  { id: 'category-profit', title: 'Category Profitability', topic: 'profitability', component: 'CategoryProfitWidget', size: 'large', visible: true, order: 16, icon: 'pie_chart' },
  { id: 'store-performance', title: 'Store Performance', topic: 'profitability', component: 'StorePerformanceWidget', size: 'large', visible: false, order: 17, icon: 'business' },
  { id: 'profit-margin', title: 'Profit Margin', topic: 'profitability', component: 'ProfitMarginWidget', size: 'small', visible: true, order: 18, icon: 'percent' },
  // Wastage widgets
  { id: 'wastage-summary', title: 'Wastage Summary', topic: 'wastage', component: 'WastageSummaryWidget', size: 'medium', visible: true, order: 19, icon: 'delete_sweep' },
  { id: 'wastage-trend', title: 'Wastage Trend', topic: 'wastage', component: 'WastageTrendWidget', size: 'large', visible: false, order: 20, icon: 'timeline' },
  { id: 'wastage-by-category', title: 'Wastage by Category', topic: 'wastage', component: 'WastageByCategoryWidget', size: 'medium', visible: true, order: 21, icon: 'donut_large' },
];

@Injectable({ providedIn: 'root' })
export class WidgetService {
  private storageKey = 'erp_widget_config';
  private widgetsSubject = new BehaviorSubject<WidgetConfig[]>(this.loadWidgets());

  widgets$ = this.widgetsSubject.asObservable();

  private loadWidgets(): WidgetConfig[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...DEFAULT_WIDGETS];
  }

  private save(widgets: WidgetConfig[]) {
    try { localStorage.setItem(this.storageKey, JSON.stringify(widgets)); } catch {}
    this.widgetsSubject.next(widgets);
  }

  getWidgetsByTopic(topic: WidgetTopic): WidgetConfig[] {
    return this.widgetsSubject.value.filter(w => w.topic === topic).sort((a, b) => a.order - b.order);
  }

  getVisibleWidgets(): WidgetConfig[] {
    return this.widgetsSubject.value.filter(w => w.visible).sort((a, b) => a.order - b.order);
  }

  toggleWidget(id: string) {
    const widgets = this.widgetsSubject.value.map(w =>
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    this.save(widgets);
  }

  reorderWidgets(widgets: WidgetConfig[]) {
    const updated = widgets.map((w, i) => ({ ...w, order: i }));
    this.save(updated);
  }

  resetToDefault() {
    this.save([...DEFAULT_WIDGETS]);
  }

  getAllTopics(): WidgetTopic[] {
    return ['sales', 'customer', 'inventory', 'promotions', 'profitability', 'wastage'];
  }
}
