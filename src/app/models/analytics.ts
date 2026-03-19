// Dashboard Overview Models

export type TimePeriod = 'today' | 'week' | 'month' | 'year';

export interface KPITarget {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'exceeded' | 'met' | 'below' | 'critical';
}

export interface BranchSnapshot {
  branchName: string;
  revenue: number;
  sales: number;
  transactions: number;
  customers: number;
  performance: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

export interface CustomerSegment {
  segment: string;
  count: number;
  revenue: number;
  avgSpend: number;
  color: string;
}

export interface CustomerRetention {
  labels: string[];
  rates: number[];
}

export interface CustomerAcquisition {
  labels: string[];
  newCustomers: number[];
  churned: number[];
}

export interface CustomerSatisfaction {
  nps: number;
  csat: number;
  reviews: number;
  positive: number;
}

export interface WastageSummary {
  totalWastage: string;
  wastePercentage: number;
  trend: number;
  items: number;
}

export interface WastageCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface WastageTrend {
  labels: string[];
  values: number[];
}

export interface WastageItem {
  name: string;
  amount: number;
  reason: string;
  units: number;
}

export interface Promotion {
  name: string;
  type: string;
  status: string;
  redemptions: number;
  revenue: number;
  endDate: string;
  discount: number;
}

export interface PromotionPerformance {
  labels: string[];
  redemptions: number[];
  revenue: number[];
}

export interface PromotionSummary {
  totalPromos: number;
  activePromos: number;
  totalRedemptions: number;
  revenueImpact: number;
  avgDiscount: number;
}

export interface CompleteCustomerData {
  segments: CustomerSegment[];
  retention: CustomerRetention;
  acquisitionTrend: CustomerAcquisition;
  satisfaction: CustomerSatisfaction;
}

export interface CompleteWastageData {
  summary: WastageSummary;
  byCategory: WastageCategory[];
  weeklyTrend: WastageTrend;
  topWastedItems: WastageItem[];
}

export interface CompletePromotionData {
  active: Promotion[];
  performance: PromotionPerformance;
  summary: PromotionSummary;
}

export interface DashboardMetrics {
  todaySales: MetricCard;
  transactions: MetricCard;
  avgBillValue: MetricCard;
  paymentSplit: MetricCard;
}

export interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  changeLabel?: string;
}

// Sales Trend
export interface SalesTrendData {
  labels: string[];
  actualSales: number[];
  target?: number[];
}

// Top Performing Products/Widgets
export interface TopPerformingItem {
  rank: number;
  name: string;
  category: string;
  amount: number;
  change?: number;
}

// Top Customers/Brands
export interface TopCustomer {
  rank: number;
  name: string;
  type: string;
  amount: number;
  orders?: number;
}

// Inventory Alerts
export interface InventoryAlert {
  productName: string;
  currentStock: number;
  unit: string;
  status: 'critical' | 'warning' | 'low';
  percentage: number;
}

// Payment Methods
export interface PaymentMethod {
  method: string;
  percentage: number;
  color: string;
}

// Branch Snapshot
export interface BranchSnapshot {
  branchName: string;
  revenue: number;
  sales: number;
  transactions: number;
  customers: number;
  performance: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

// Insights Page Models
export interface InsightMetrics {
  revenueGrowth: MetricCard;
  avgProfitMargin: MetricCard;
  salesRepTransaction: MetricCard;
  avgDays: MetricCard;
}

export interface DailySalesData {
  labels: string[];
  actualSales: number[];
  target: number[];
  bestDay: string;
  bestDayValue: number;
  recentDay: string;
  recentDayRevenue: number;
  avgDailySales: number;
}

export interface RecentSalesPattern {
  labels: string[];
  values: number[];
  maxValue: number;
  status: 'up' | 'down';
}

export interface ProfitabilityCategory {
  category: string;
  grossProfit: number;
  color: string;
}

export interface BestSellingProduct {
  rank: number;
  name: string;
  category: string;
  quantity: number;
  change: number;
}

export interface ProductRecommendation {
  name: string;
  label: 'Other' | 'Bestseller' | 'New' | 'Idle';
  impact: number;
  color: string;
}

export interface StorePerformance {
  storeName: string;
  revenue: number;
  performance: number;
  avgBillValue: number;
  transactions: number;
  purchaseFrequency: number;
}

export interface CompleteAnalytics {
  dashboard: {
    metrics: DashboardMetrics;
    salesTrend: SalesTrendData;
    topProducts: TopPerformingItem[];
    topCustomers: TopCustomer[];
    topBrands: TopCustomer[];
    inventoryAlerts: InventoryAlert[];
    paymentMethods: PaymentMethod[];
    branches: BranchSnapshot[];
  };
  insights: {
    metrics: InsightMetrics;
    dailySales: DailySalesData;
    recentSalesPattern: RecentSalesPattern;
    profitability: ProfitabilityCategory[];
    bestSellingProducts: BestSellingProduct[];
    productRecommendations: ProductRecommendation[];
    storePerformances: StorePerformance[];
  };
}

export interface ExtendedAnalytics extends CompleteAnalytics {
  customerData?: CompleteCustomerData;
  wastageData?: CompleteWastageData;
  promotionData?: CompletePromotionData;
  kpis?: KPI[];
  realTimeEvents?: RealTimeEvent[];
  predictiveAnalytics?: PredictiveAnalytics;
}

import { ThemePalette } from '@angular/material/core';

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  category?: string;
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  status: 'exceeded' | 'met' | 'below' | 'critical';
  color: ThemePalette;
}

export interface PredictiveAnalytics {
  forecast: number[];
  confidenceInterval: [number, number][];
  seasonality: number;
  trend: number;
  accuracy: number;
}

export interface RealTimeEvent {
  id: string;
  type: 'sale' | 'inventory' | 'customer' | 'alert' | 'system';
  timestamp: Date;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  icon: string;
  data?: any;
}

export interface WidgetConfig {
  id: string;
  title: string;
  topic: WidgetTopic;
  component: string;
  size: 'small' | 'medium' | 'large' | 'full';
  visible: boolean;
  order: number;
  icon: string;
}

export type WidgetTopic =
  | 'sales'
  | 'customer'
  | 'inventory'
  | 'promotions'
  | 'profitability'
  | 'wastage';

//#region sales trend widget data model enhanced
// models/sales-trend.models.ts
export type TrendDimension =
  | 'overall'
  | 'customer_type'
  | 'specific_customer'
  | 'product_category'
  | 'branch'
  | 'payment_method'
  | 'time_of_day'
  | 'day_of_week'
  | 'promotion_type'
  | 'staff_performance';

export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter';

export interface DimensionOption {
  value: TrendDimension;
  label: string;
  icon: string;
  color: string;
  subOptions?: { value: string; label: string }[];
}

export interface TrendDataPoint {
  label: string;
  value: number;
  previousValue?: number;
  target?: number;
  color?: string;
}

export interface TrendDataset {
  dimension: TrendDimension;
  dimensionValue?: string;
  data: TrendDataPoint[];
  comparison?: TrendDataPoint[];
  insights: {
    total: number;
    average: number;
    growth: number;
    peak: { label: string; value: number };
    low: { label: string; value: number };
  };
}
//#endregion
