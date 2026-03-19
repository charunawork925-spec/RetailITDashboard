// services/analytics.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  CompleteAnalytics,
  TimePeriod,
  CompleteCustomerData,
  CompleteWastageData,
  CompletePromotionData,
  KPI,
  RealTimeEvent,
  PredictiveAnalytics,
  ExtendedAnalytics,
  CustomerSegment,
  CustomerRetention,
  CustomerAcquisition,
  CustomerSatisfaction,
  WastageSummary,
  WastageCategory,
  WastageTrend,
  WastageItem,
  Promotion,
  PromotionPerformance,
  PromotionSummary,
  DailySalesData,
  RecentSalesPattern,
  ProductRecommendation,
  InventoryAlert,
  BranchSnapshot,
} from '../models/analytics';
import { HttpClient } from '@angular/common/http';

// NEW — shape returned by getSalesByCustomer
export interface SalesTrend {
  labels: string[];
  actualSales: number[];
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private mockDataByPeriod: Record<TimePeriod, ExtendedAnalytics> = {
    today: this.generateTodayData(),
    week: this.generateWeekData(),
    month: this.generateMonthData(),
    year: this.generateYearData(),
  };

  constructor(private http: HttpClient) {}

  getCompleteAnalytics(
    period: TimePeriod = 'today',
  ): Observable<ExtendedAnalytics> {
    console.log(`Fetching complete analytics for period: ${period}`);
    return of(this.mockDataByPeriod[period]).pipe(delay(500));
  }

  getKPIs(period: TimePeriod = 'today'): Observable<KPI[]> {
    return of(this.generateKPIs(period)).pipe(delay(300));
  }

  getRealTimeEvents(): Observable<RealTimeEvent[]> {
    return of(this.generateRealTimeEvents()).pipe(delay(200));
  }

  getPredictiveAnalytics(
    period: TimePeriod = 'month',
  ): Observable<PredictiveAnalytics> {
    return of(this.generatePredictiveAnalytics(period)).pipe(delay(800));
  }

  // ─── NEW: customer-scoped sales trend ────────────────────────────────────

  getSalesByCustomer(
    customerId: string,
    period: TimePeriod,
  ): Observable<SalesTrend> {
    const baseTrend = this.mockDataByPeriod[period].dashboard.salesTrend;
    const multiplier = this.getCustomerSpendMultiplier(customerId, period);

    const customerSales = baseTrend.actualSales.map((v) =>
      Math.round(v * multiplier),
    );

    return of({
      labels: [...baseTrend.labels],
      actualSales: customerSales,
    }).pipe(delay(300));
  }

  private getCustomerSpendMultiplier(
    customerId: string,
    period: TimePeriod,
  ): number {
    // Total store sales per period (matches dashboard metrics)
    const totalSales: Record<TimePeriod, number> = {
      today: 24563,
      week: 142890,
      month: 589340,
      year: 6824500,
    };

    // Base daily spend per customer (amount from generateTopCustomers multiplier=1)
    const customerBaseSpend: Record<string, number> = {
      'Scott Fernando': 2430,
      'Rowen Silva': 1689,
      'Hasini Wijeratne': 1473,
      'Chathurika Fernandes': 1425,
      'Demal Perera': 1346,
    };

    const periodMultipliers: Record<TimePeriod, number> = {
      today: 1,
      week: 7,
      month: 30,
      year: 365,
    };

    const baseSpend = customerBaseSpend[customerId];
    if (!baseSpend) return 0.05; // unknown customer — small default share

    const customerPeriodSpend = baseSpend * periodMultipliers[period];
    return customerPeriodSpend / totalSales[period];
  }

  // ─── existing private generators (all unchanged) ─────────────────────────

  private generateTodayData(): ExtendedAnalytics {
    const multiplier = 1;
    return {
      dashboard: {
        metrics: {
          todaySales: {
            label: "Today's Sales",
            value: 'Rs. 24,563',
            change: 13.5,
            changeLabel: '+13.5%',
          },
          transactions: {
            label: 'Transactions',
            value: 1429,
            change: 4.2,
            changeLabel: '+4.2%',
          },
          avgBillValue: {
            label: 'Avg Bill Value',
            value: 'Rs. 17.19',
            change: -3.2,
            changeLabel: '-3.2%',
          },
          paymentSplit: {
            label: 'Payment Split',
            value: '65/35',
            change: 0,
            changeLabel: 'Card/Cash',
          },
        },
        salesTrend: {
          labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'],
          actualSales: [120, 280, 450, 520, 610, 580, 390, 210],
        },
        topProducts: this.generateTopProducts(multiplier),
        topCustomers: this.generateTopCustomers(multiplier),
        topBrands: this.generateTopBrands(multiplier),
        inventoryAlerts: this.generateInventoryAlerts(multiplier),
        paymentMethods: [
          { method: 'Card', percentage: 65, color: '#4F46E5' },
          { method: 'Cash', percentage: 26, color: '#F59E0B' },
          { method: 'Digital Wallet', percentage: 9, color: '#10B981' },
        ],
        branches: this.generateBranches(multiplier),
      },
      insights: {
        metrics: {
          revenueGrowth: {
            label: 'Revenue Growth',
            value: '+12.5%',
            change: 12.5,
          },
          avgProfitMargin: {
            label: 'Avg Profit Margin',
            value: '34.2%',
            change: 2.8,
          },
          salesRepTransaction: {
            label: 'Sales Rep Transaction',
            value: '3.8',
            change: -0.6,
          },
          avgDays: { label: '18 days', value: '18 days', change: 0 },
        },
        dailySales: this.generateDailySales('today'),
        recentSalesPattern: this.generateRecentSalesPattern('today'),
        profitability: this.generateProfitability(multiplier),
        bestSellingProducts: this.generateBestSellingProducts(multiplier),
        productRecommendations: this.generateProductRecommendations(multiplier),
        storePerformances: this.generateStorePerformances(multiplier),
      },
      customerData: this.generateCustomerData(multiplier, 'today'),
      wastageData: this.generateWastageData(multiplier, 'today'),
      promotionData: this.generatePromotionData(multiplier, 'today'),
      kpis: this.generateKPIs('today'),
      realTimeEvents: this.generateRealTimeEvents(),
      predictiveAnalytics: this.generatePredictiveAnalytics('today'),
    };
  }

  private generateWeekData(): ExtendedAnalytics {
    const multiplier = 7;
    return {
      dashboard: {
        metrics: {
          todaySales: {
            label: 'This Week',
            value: 'Rs. 142,890',
            change: 8.7,
            changeLabel: '+8.7%',
          },
          transactions: {
            label: 'Transactions',
            value: 8240,
            change: 5.3,
            changeLabel: '+5.3%',
          },
          avgBillValue: {
            label: 'Avg Bill Value',
            value: 'Rs. 17.34',
            change: 2.1,
            changeLabel: '+2.1%',
          },
          paymentSplit: {
            label: 'Payment Split',
            value: '62/38',
            change: 0,
            changeLabel: 'Card/Cash',
          },
        },
        salesTrend: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          actualSales: [18500, 20200, 19800, 22400, 25600, 28900, 24700],
        },
        topProducts: this.generateTopProducts(multiplier),
        topCustomers: this.generateTopCustomers(multiplier),
        topBrands: this.generateTopBrands(multiplier),
        inventoryAlerts: this.generateInventoryAlerts(multiplier),
        paymentMethods: [
          { method: 'Card', percentage: 62, color: '#4F46E5' },
          { method: 'Cash', percentage: 28, color: '#F59E0B' },
          { method: 'Digital Wallet', percentage: 10, color: '#10B981' },
        ],
        branches: this.generateBranches(multiplier),
      },
      insights: {
        metrics: {
          revenueGrowth: {
            label: 'Weekly Growth',
            value: '+8.7%',
            change: 8.7,
          },
          avgProfitMargin: {
            label: 'Avg Profit Margin',
            value: '35.8%',
            change: 1.6,
          },
          salesRepTransaction: {
            label: 'Sales Rep Transaction',
            value: '4.2',
            change: 0.4,
          },
          avgDays: { label: '7 days', value: '7 days', change: 0 },
        },
        dailySales: this.generateDailySales('week'),
        recentSalesPattern: this.generateRecentSalesPattern('week'),
        profitability: this.generateProfitability(multiplier),
        bestSellingProducts: this.generateBestSellingProducts(multiplier),
        productRecommendations: this.generateProductRecommendations(multiplier),
        storePerformances: this.generateStorePerformances(multiplier),
      },
      customerData: this.generateCustomerData(multiplier, 'week'),
      wastageData: this.generateWastageData(multiplier, 'week'),
      promotionData: this.generatePromotionData(multiplier, 'week'),
      kpis: this.generateKPIs('week'),
      realTimeEvents: this.generateRealTimeEvents(),
      predictiveAnalytics: this.generatePredictiveAnalytics('week'),
    };
  }

  private generateMonthData(): ExtendedAnalytics {
    const multiplier = 30;
    return {
      dashboard: {
        metrics: {
          todaySales: {
            label: 'This Month',
            value: 'Rs. 589,340',
            change: 15.2,
            changeLabel: '+15.2%',
          },
          transactions: {
            label: 'Transactions',
            value: 32450,
            change: 12.8,
            changeLabel: '+12.8%',
          },
          avgBillValue: {
            label: 'Avg Bill Value',
            value: 'Rs. 18.16',
            change: 4.3,
            changeLabel: '+4.3%',
          },
          paymentSplit: {
            label: 'Payment Split',
            value: '68/32',
            change: 0,
            changeLabel: 'Card/Cash',
          },
        },
        salesTrend: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          actualSales: [135000, 142000, 151000, 161340],
        },
        topProducts: this.generateTopProducts(multiplier),
        topCustomers: this.generateTopCustomers(multiplier),
        topBrands: this.generateTopBrands(multiplier),
        inventoryAlerts: this.generateInventoryAlerts(multiplier),
        paymentMethods: [
          { method: 'Card', percentage: 68, color: '#4F46E5' },
          { method: 'Cash', percentage: 22, color: '#F59E0B' },
          { method: 'Digital Wallet', percentage: 10, color: '#10B981' },
        ],
        branches: this.generateBranches(multiplier),
      },
      insights: {
        metrics: {
          revenueGrowth: {
            label: 'Monthly Growth',
            value: '+15.2%',
            change: 15.2,
          },
          avgProfitMargin: {
            label: 'Avg Profit Margin',
            value: '37.4%',
            change: 3.2,
          },
          salesRepTransaction: {
            label: 'Sales Rep Transaction',
            value: '4.5',
            change: 0.7,
          },
          avgDays: { label: '30 days', value: '30 days', change: 0 },
        },
        dailySales: this.generateDailySales('month'),
        recentSalesPattern: this.generateRecentSalesPattern('month'),
        profitability: this.generateProfitability(multiplier),
        bestSellingProducts: this.generateBestSellingProducts(multiplier),
        productRecommendations: this.generateProductRecommendations(multiplier),
        storePerformances: this.generateStorePerformances(multiplier),
      },
      customerData: this.generateCustomerData(multiplier, 'month'),
      wastageData: this.generateWastageData(multiplier, 'month'),
      promotionData: this.generatePromotionData(multiplier, 'month'),
      kpis: this.generateKPIs('month'),
      realTimeEvents: this.generateRealTimeEvents(),
      predictiveAnalytics: this.generatePredictiveAnalytics('month'),
    };
  }

  private generateYearData(): ExtendedAnalytics {
    const multiplier = 365;
    return {
      dashboard: {
        metrics: {
          todaySales: {
            label: 'This Year',
            value: 'Rs. 6,824,500',
            change: 22.3,
            changeLabel: '+22.3%',
          },
          transactions: {
            label: 'Transactions',
            value: 389400,
            change: 18.5,
            changeLabel: '+18.5%',
          },
          avgBillValue: {
            label: 'Avg Bill Value',
            value: 'Rs. 17.53',
            change: 2.8,
            changeLabel: '+2.8%',
          },
          paymentSplit: {
            label: 'Payment Split',
            value: '70/30',
            change: 0,
            changeLabel: 'Card/Cash',
          },
        },
        salesTrend: {
          labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          actualSales: [
            450000, 495000, 520000, 510000, 580000, 620000, 590000, 610000,
            630000, 680000, 720000, 699500,
          ],
        },
        topProducts: this.generateTopProducts(multiplier),
        topCustomers: this.generateTopCustomers(multiplier),
        topBrands: this.generateTopBrands(multiplier),
        inventoryAlerts: this.generateInventoryAlerts(multiplier),
        paymentMethods: [
          { method: 'Card', percentage: 70, color: '#4F46E5' },
          { method: 'Cash', percentage: 20, color: '#F59E0B' },
          { method: 'Digital Wallet', percentage: 10, color: '#10B981' },
        ],
        branches: this.generateBranches(multiplier),
      },
      insights: {
        metrics: {
          revenueGrowth: {
            label: 'Yearly Growth',
            value: '+22.3%',
            change: 22.3,
          },
          avgProfitMargin: {
            label: 'Avg Profit Margin',
            value: '38.1%',
            change: 4.5,
          },
          salesRepTransaction: {
            label: 'Sales Rep Transaction',
            value: '4.8',
            change: 1.2,
          },
          avgDays: { label: '365 days', value: '365 days', change: 0 },
        },
        dailySales: this.generateDailySales('year'),
        recentSalesPattern: this.generateRecentSalesPattern('year'),
        profitability: this.generateProfitability(multiplier),
        bestSellingProducts: this.generateBestSellingProducts(multiplier),
        productRecommendations: this.generateProductRecommendations(multiplier),
        storePerformances: this.generateStorePerformances(multiplier),
      },
      customerData: this.generateCustomerData(multiplier, 'year'),
      wastageData: this.generateWastageData(multiplier, 'year'),
      promotionData: this.generatePromotionData(multiplier, 'year'),
      kpis: this.generateKPIs('year'),
      realTimeEvents: this.generateRealTimeEvents(),
      predictiveAnalytics: this.generatePredictiveAnalytics('year'),
    };
  }

  private generateKPIs(period: TimePeriod): KPI[] {
    const baseKPIs: KPI[] = [
      {
        id: 'revenue',
        name: 'Revenue',
        value:
          period === 'today'
            ? 24563
            : period === 'week'
              ? 142890
              : period === 'month'
                ? 589340
                : 6824500,
        previousValue:
          period === 'today'
            ? 21635
            : period === 'week'
              ? 131400
              : period === 'month'
                ? 511800
                : 5580000,
        target:
          period === 'today'
            ? 25000
            : period === 'week'
              ? 150000
              : period === 'month'
                ? 600000
                : 7000000,
        unit: 'Rs',
        trend: 'up' as const,
        changePercentage:
          period === 'today'
            ? 13.5
            : period === 'week'
              ? 8.7
              : period === 'month'
                ? 15.2
                : 22.3,
        status:
          period === 'today'
            ? ('met' as const)
            : period === 'week'
              ? ('met' as const)
              : period === 'month'
                ? ('exceeded' as const)
                : ('exceeded' as const),
        color: 'primary',
      },
      {
        id: 'transactions',
        name: 'Transactions',
        value:
          period === 'today'
            ? 1429
            : period === 'week'
              ? 8240
              : period === 'month'
                ? 32450
                : 389400,
        previousValue:
          period === 'today'
            ? 1371
            : period === 'week'
              ? 7825
              : period === 'month'
                ? 28768
                : 328800,
        target:
          period === 'today'
            ? 1500
            : period === 'week'
              ? 8500
              : period === 'month'
                ? 33000
                : 400000,
        unit: 'count',
        trend: 'up' as const,
        changePercentage:
          period === 'today'
            ? 4.2
            : period === 'week'
              ? 5.3
              : period === 'month'
                ? 12.8
                : 18.5,
        status:
          period === 'today'
            ? ('below' as const)
            : period === 'week'
              ? ('below' as const)
              : period === 'month'
                ? ('met' as const)
                : ('met' as const),
        color: 'accent',
      },
      {
        id: 'avgBill',
        name: 'Avg Bill Value',
        value:
          period === 'today'
            ? 17.19
            : period === 'week'
              ? 17.34
              : period === 'month'
                ? 18.16
                : 17.53,
        previousValue:
          period === 'today'
            ? 17.76
            : period === 'week'
              ? 16.99
              : period === 'month'
                ? 17.41
                : 17.05,
        target: 18.0,
        unit: 'Rs',
        trend: period === 'today' ? ('down' as const) : ('up' as const),
        changePercentage:
          period === 'today'
            ? -3.2
            : period === 'week'
              ? 2.1
              : period === 'month'
                ? 4.3
                : 2.8,
        status:
          period === 'today'
            ? ('critical' as const)
            : period === 'week'
              ? ('below' as const)
              : period === 'month'
                ? ('met' as const)
                : ('met' as const),
        color: 'warn',
      },
      {
        id: 'profitMargin',
        name: 'Profit Margin',
        value:
          period === 'today'
            ? 34.2
            : period === 'week'
              ? 35.8
              : period === 'month'
                ? 37.4
                : 38.1,
        previousValue:
          period === 'today'
            ? 33.3
            : period === 'week'
              ? 34.5
              : period === 'month'
                ? 36.2
                : 36.5,
        target: 35.0,
        unit: '%',
        trend: 'up' as const,
        changePercentage:
          period === 'today'
            ? 2.8
            : period === 'week'
              ? 3.8
              : period === 'month'
                ? 3.3
                : 4.4,
        status:
          period === 'today'
            ? ('met' as const)
            : period === 'week'
              ? ('exceeded' as const)
              : period === 'month'
                ? ('exceeded' as const)
                : ('exceeded' as const),
        color: 'primary',
      },
    ];
    return baseKPIs;
  }

  private generateRealTimeEvents(): RealTimeEvent[] {
    return [
      {
        id: '1',
        type: 'sale' as const,
        timestamp: new Date(Date.now() - 2 * 60000),
        title: 'New sale completed',
        message: 'Customer Scott Fernando purchased 3 items for Rs. 2,430',
        severity: 'success' as const,
        icon: 'shopping_cart',
      },
      {
        id: '2',
        type: 'inventory' as const,
        timestamp: new Date(Date.now() - 15 * 60000),
        title: 'Low stock alert',
        message: 'Butter 100g is running low (45 units remaining)',
        severity: 'warning' as const,
        icon: 'inventory',
      },
      {
        id: '3',
        type: 'customer' as const,
        timestamp: new Date(Date.now() - 32 * 60000),
        title: 'New customer registered',
        message: 'Chathurika Fernandes joined as a new customer',
        severity: 'info' as const,
        icon: 'person_add',
      },
      {
        id: '4',
        type: 'sale' as const,
        timestamp: new Date(Date.now() - 47 * 60000),
        title: 'Bulk order placed',
        message: 'Order of 50 units of Fresh Milk 1L from Uptown branch',
        severity: 'success' as const,
        icon: 'local_mall',
      },
      {
        id: '5',
        type: 'alert' as const,
        timestamp: new Date(Date.now() - 120 * 60000),
        title: 'System backup completed',
        message: 'Daily backup completed successfully',
        severity: 'info' as const,
        icon: 'backup',
      },
      {
        id: '6',
        type: 'inventory' as const,
        timestamp: new Date(Date.now() - 185 * 60000),
        title: 'Stock replenished',
        message: 'New stock arrived for Cheese Slices 200g',
        severity: 'success' as const,
        icon: 'inventory_2',
      },
    ];
  }

  private generatePredictiveAnalytics(period: TimePeriod): PredictiveAnalytics {
    const baseForecast =
      period === 'today'
        ? [25000, 26500, 28000, 29500, 31000]
        : period === 'week'
          ? [150000, 158000, 165000, 172000, 180000]
          : period === 'month'
            ? [600000, 625000, 650000, 675000, 700000]
            : [7000000, 7300000, 7600000, 7900000, 8200000];

    return {
      forecast: baseForecast,
      confidenceInterval: baseForecast.map((value) => [
        value * 0.9,
        value * 1.1,
      ]) as [number, number][],
      seasonality:
        period === 'today'
          ? 1.2
          : period === 'week'
            ? 1.15
            : period === 'month'
              ? 1.1
              : 1.05,
      trend:
        period === 'today'
          ? 1.08
          : period === 'week'
            ? 1.07
            : period === 'month'
              ? 1.06
              : 1.05,
      accuracy:
        period === 'today'
          ? 0.92
          : period === 'week'
            ? 0.89
            : period === 'month'
              ? 0.87
              : 0.85,
    };
  }

  private generateTopProducts(multiplier: number) {
    return [
      {
        rank: 1,
        name: 'Fresh Milk 1L',
        category: 'Dairy Products',
        amount: Math.round(12420 * multiplier),
        change: 5.2,
      },
      {
        rank: 2,
        name: 'Cold Powder 100g',
        category: 'FMCG',
        amount: Math.round(9430 * multiplier),
        change: -2.1,
      },
      {
        rank: 3,
        name: 'Cooking Oil 1L',
        category: 'Grocery',
        amount: Math.round(8280 * multiplier),
        change: 8.5,
      },
      {
        rank: 4,
        name: 'Coffee 100g',
        category: 'Beverages',
        amount: Math.round(5472 * multiplier),
        change: 3.7,
      },
      {
        rank: 5,
        name: 'Dahl Wash Liquid 500ml',
        category: 'Household',
        amount: Math.round(3758 * multiplier),
        change: -1.2,
      },
    ];
  }

  private generateTopCustomers(multiplier: number) {
    return [
      {
        rank: 1,
        name: 'Scott Fernando',
        type: 'Regular Customer',
        amount: Math.round(2430 * multiplier),
        orders: Math.round(24 * multiplier),
      },
      {
        rank: 2,
        name: 'Rowen Silva',
        type: 'Premium Customer',
        amount: Math.round(1689 * multiplier),
        orders: Math.round(18 * multiplier),
      },
      {
        rank: 3,
        name: 'Hasini Wijeratne',
        type: 'Regular Customer',
        amount: Math.round(1473 * multiplier),
        orders: Math.round(15 * multiplier),
      },
      {
        rank: 4,
        name: 'Chathurika Fernandes',
        type: 'New Customer',
        amount: Math.round(1425 * multiplier),
        orders: Math.round(12 * multiplier),
      },
      {
        rank: 5,
        name: 'Demal Perera',
        type: 'Premium Customer',
        amount: Math.round(1346 * multiplier),
        orders: Math.round(20 * multiplier),
      },
    ];
  }

  private generateTopBrands(multiplier: number) {
    return [
      {
        rank: 1,
        name: 'Nestlé',
        type: 'Food & Beverage',
        amount: Math.round(3340 * multiplier),
      },
      {
        rank: 2,
        name: 'Highland',
        type: 'Dairy',
        amount: Math.round(2690 * multiplier),
      },
      {
        rank: 3,
        name: 'Nescafe',
        type: 'Beverage',
        amount: Math.round(2480 * multiplier),
      },
      {
        rank: 4,
        name: 'Maliban',
        type: 'FMCG',
        amount: Math.round(1830 * multiplier),
      },
      {
        rank: 5,
        name: 'Siddhalepa',
        type: 'Healthcare',
        amount: Math.round(1460 * multiplier),
      },
    ];
  }

  private generateInventoryAlerts(multiplier: number): InventoryAlert[] {
    return [
      {
        productName: 'Butter 100g',
        currentStock: Math.round(45 * multiplier),
        unit: 'units remaining',
        status: 'critical' as const,
        percentage: 20,
      },
      {
        productName: 'Cheese Slices 200g',
        currentStock: Math.round(89 * multiplier),
        unit: 'units remaining',
        status: 'warning' as const,
        percentage: 40,
      },
      {
        productName: 'Pepper Powder 25g',
        currentStock: Math.round(156 * multiplier),
        unit: 'units remaining',
        status: 'low' as const,
        percentage: 60,
      },
      {
        productName: 'Mushrooms 1L',
        currentStock: Math.round(243 * multiplier),
        unit: 'units remaining',
        status: 'low' as const,
        percentage: 80,
      },
    ];
  }

  private generateBranches(multiplier: number): BranchSnapshot[] {
    return [
      {
        branchName: 'Downtown',
        revenue: Math.round(6291 * multiplier),
        sales: Math.round(245 * multiplier),
        transactions: Math.round(156 * multiplier),
        customers: Math.round(89 * multiplier),
        performance: 130,
        status: 'excellent' as const,
      },
      {
        branchName: 'Uptown',
        revenue: Math.round(8681 * multiplier),
        sales: Math.round(312 * multiplier),
        transactions: Math.round(187 * multiplier),
        customers: Math.round(102 * multiplier),
        performance: 147,
        status: 'excellent' as const,
      },
      {
        branchName: 'Suburb',
        revenue: Math.round(1553 * multiplier),
        sales: Math.round(98 * multiplier),
        transactions: Math.round(62 * multiplier),
        customers: Math.round(45 * multiplier),
        performance: -5,
        status: 'poor' as const,
      },
      {
        branchName: 'Mall',
        revenue: Math.round(1609 * multiplier),
        sales: Math.round(134 * multiplier),
        transactions: Math.round(78 * multiplier),
        customers: Math.round(51 * multiplier),
        performance: 2,
        status: 'average' as const,
      },
    ];
  }

  private generateProfitability(multiplier: number) {
    return [
      {
        category: 'Hardware Gallery',
        grossProfit: Math.round(16750000 * multiplier),
        color: '#059669',
      },
      {
        category: 'Food Partners',
        grossProfit: Math.round(12340000 * multiplier),
        color: '#10B981',
      },
      {
        category: 'Specialty Tea',
        grossProfit: Math.round(8920000 * multiplier),
        color: '#34D399',
      },
      {
        category: 'Electronics',
        grossProfit: Math.round(7650000 * multiplier),
        color: '#A855F7',
      },
      {
        category: 'Stationery',
        grossProfit: Math.round(5430000 * multiplier),
        color: '#EC4899',
      },
    ];
  }

  private generateBestSellingProducts(multiplier: number) {
    return [
      {
        rank: 1,
        name: 'Wireless Headphones',
        category: 'Electronics',
        quantity: Math.round(14388 * multiplier),
        change: 12,
      },
      {
        rank: 2,
        name: 'Smartphone Case',
        category: 'Accessories',
        quantity: Math.round(8590 * multiplier),
        change: -13,
      },
      {
        rank: 3,
        name: 'T-Shirt Basic',
        category: 'Apparel',
        quantity: Math.round(7380 * multiplier),
        change: 8,
      },
      {
        rank: 4,
        name: 'Coffee Maker',
        category: 'Home Appliance',
        quantity: Math.round(12149 * multiplier),
        change: 15,
      },
      {
        rank: 5,
        name: 'Running Shoes',
        category: 'Footwear',
        quantity: Math.round(14291 * multiplier),
        change: -24,
      },
    ];
  }

  private generateProductRecommendations(
    multiplier: number,
  ): ProductRecommendation[] {
    return [
      {
        name: 'Current Limia',
        label: 'Other' as const,
        impact: Math.round(1020 * multiplier),
        color: '#FFD700',
      },
      {
        name: 'Sunscreen',
        label: 'Bestseller' as const,
        impact: Math.round(850 * multiplier),
        color: '#10B981',
      },
      {
        name: 'Avocado Toast',
        label: 'Idle' as const,
        impact: Math.round(-320 * multiplier),
        color: '#EF4444',
      },
      {
        name: 'Premium Coffee',
        label: 'New' as const,
        impact: Math.round(1180 * multiplier),
        color: '#3B82F6',
      },
    ];
  }

  private generateStorePerformances(multiplier: number) {
    return [
      {
        storeName: 'Kelaniya',
        revenue: Math.round(48695 * multiplier),
        performance: 146,
        avgBillValue: Math.round(11781 * multiplier),
        transactions: Math.round(290 * multiplier),
        purchaseFrequency: Math.round(1491 * multiplier),
      },
      {
        storeName: 'Dehiwala',
        revenue: Math.round(21746 * multiplier),
        performance: 123,
        avgBillValue: Math.round(9350 * multiplier),
        transactions: Math.round(187 * multiplier),
        purchaseFrequency: Math.round(1446 * multiplier),
      },
      {
        storeName: 'Galle',
        revenue: Math.round(18254 * multiplier),
        performance: -3,
        avgBillValue: Math.round(7420 * multiplier),
        transactions: Math.round(156 * multiplier),
        purchaseFrequency: Math.round(892 * multiplier),
      },
      {
        storeName: 'Negombo',
        revenue: Math.round(16891 * multiplier),
        performance: 96,
        avgBillValue: Math.round(8934 * multiplier),
        transactions: Math.round(201 * multiplier),
        purchaseFrequency: Math.round(934 * multiplier),
      },
    ];
  }

  private generateDailySales(period: string): DailySalesData {
    const baseData = {
      today: {
        labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'],
        actualSales: [120, 280, 450, 520, 610, 580, 390],
        target: [300, 300, 300, 300, 300, 300, 300],
        bestDay: '6pm',
        bestDayValue: 610,
        recentDay: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        recentDayRevenue: 24563,
        avgDailySales: 377,
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        actualSales: [18500, 20200, 19800, 22400, 25600, 28900, 24700],
        target: [20000, 20000, 20000, 22000, 24000, 26000, 24000],
        bestDay: 'Sat',
        bestDayValue: 28900,
        recentDay: 'Sun',
        recentDayRevenue: 24700,
        avgDailySales: 22871,
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        actualSales: [135000, 142000, 151000, 161340],
        target: [140000, 140000, 150000, 150000],
        bestDay: 'Week 4',
        bestDayValue: 161340,
        recentDay: 'Week 4',
        recentDayRevenue: 161340,
        avgDailySales: 147335,
      },
      year: {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        actualSales: [
          450000, 495000, 520000, 510000, 580000, 620000, 590000, 610000,
          630000, 680000, 720000, 699500,
        ],
        target: [
          500000, 500000, 525000, 525000, 550000, 575000, 575000, 600000,
          600000, 650000, 675000, 700000,
        ],
        bestDay: 'Nov',
        bestDayValue: 720000,
        recentDay: 'Dec',
        recentDayRevenue: 699500,
        avgDailySales: 597000,
      },
    };
    return baseData[period as keyof typeof baseData] as DailySalesData;
  }

  private generateRecentSalesPattern(period: string): RecentSalesPattern {
    const baseData = {
      today: {
        labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'],
        values: [120, 280, 450, 520, 610, 580, 390],
        maxValue: 610,
        status: 'up' as const,
      },
      week: {
        labels: [
          'Past 1D',
          'Past 2D',
          'Past 3D',
          'Past 4D',
          'Past 5D',
          'Past 6D',
          'Past 7D',
        ],
        values: [18500, 20200, 19800, 22400, 25600, 28900, 24700],
        maxValue: 28900,
        status: 'up' as const,
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [135000, 142000, 151000, 161340],
        maxValue: 161340,
        status: 'up' as const,
      },
      year: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        values: [1465000, 1710000, 1830000, 2099500],
        maxValue: 2099500,
        status: 'up' as const,
      },
    };
    return baseData[period as keyof typeof baseData] as RecentSalesPattern;
  }

  private generateCustomerData(
    multiplier: number,
    period: string,
  ): CompleteCustomerData {
    return {
      segments: this.generateCustomerSegments(multiplier, period),
      retention: this.generateCustomerRetention(period),
      acquisitionTrend: this.generateCustomerAcquisition(period),
      satisfaction: this.generateCustomerSatisfaction(multiplier, period),
    };
  }

  private generateCustomerSegments(
    multiplier: number,
    period: string,
  ): CustomerSegment[] {
    return [
      {
        segment: 'Premium',
        count: Math.round(342 * multiplier),
        revenue: Math.round(89420 * multiplier),
        avgSpend: 261,
        color: '#6366f1',
      },
      {
        segment: 'Regular',
        count: Math.round(1289 * multiplier),
        revenue: Math.round(142300 * multiplier),
        avgSpend: 110,
        color: '#3b82f6',
      },
      {
        segment: 'Occasional',
        count: Math.round(2104 * multiplier),
        revenue: Math.round(98200 * multiplier),
        avgSpend: 47,
        color: '#0ea5e9',
      },
      {
        segment: 'New',
        count: Math.round(890 * multiplier),
        revenue: Math.round(24300 * multiplier),
        avgSpend: 27,
        color: '#06b6d4',
      },
    ];
  }

  private generateCustomerRetention(period: string): CustomerRetention {
    const retention: Record<string, CustomerRetention> = {
      today: {
        labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm'],
        rates: [65, 70, 75, 72, 78, 80],
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        rates: [72, 74, 71, 76, 78, 80, 79],
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        rates: [72, 74, 73, 76],
      },
      year: {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        rates: [68, 70, 69, 72, 74, 73, 75, 77, 76, 78, 79, 80],
      },
    };
    return retention[period] || retention['week'];
  }

  private generateCustomerAcquisition(period: string): CustomerAcquisition {
    const acquisition: Record<string, CustomerAcquisition> = {
      today: {
        labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm'],
        newCustomers: [8, 15, 22, 28, 35, 30],
        churned: [2, 4, 5, 6, 7, 5],
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        newCustomers: [120, 145, 132, 168, 190, 215, 180],
        churned: [45, 38, 52, 41, 35, 28, 32],
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        newCustomers: [580, 620, 680, 750],
        churned: [160, 145, 155, 140],
      },
      year: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        newCustomers: [1850, 2100, 2350, 2600],
        churned: [450, 480, 520, 490],
      },
    };
    return acquisition[period] || acquisition['week'];
  }

  private generateCustomerSatisfaction(
    multiplier: number,
    period: string,
  ): CustomerSatisfaction {
    return {
      nps: 72,
      csat: 4.3,
      reviews: Math.round(1240 * multiplier),
      positive: 88,
    };
  }

  private generateWastageData(
    multiplier: number,
    period: string,
  ): CompleteWastageData {
    return {
      summary: this.generateWastageSummary(multiplier, period),
      byCategory: this.generateWastageByCategory(multiplier, period),
      weeklyTrend: this.generateWastageTrend(period),
      topWastedItems: this.generateTopWastedItems(multiplier),
    };
  }

  private generateWastageSummary(
    multiplier: number,
    period: string,
  ): WastageSummary {
    return {
      totalWastage: `Rs. ${(3240 * multiplier).toLocaleString()}`,
      wastePercentage: 4.2,
      trend: -8.5,
      items: Math.round(47 * multiplier),
    };
  }

  private generateWastageByCategory(
    multiplier: number,
    period: string,
  ): WastageCategory[] {
    return [
      {
        category: 'Dairy',
        amount: Math.round(1240 * multiplier),
        percentage: 38,
        color: '#ef4444',
      },
      {
        category: 'Produce',
        amount: Math.round(890 * multiplier),
        percentage: 27,
        color: '#f97316',
      },
      {
        category: 'Bakery',
        amount: Math.round(620 * multiplier),
        percentage: 19,
        color: '#eab308',
      },
      {
        category: 'Meat',
        amount: Math.round(490 * multiplier),
        percentage: 16,
        color: '#84cc16',
      },
    ];
  }

  private generateWastageTrend(period: string): WastageTrend {
    const trends: Record<string, WastageTrend> = {
      today: {
        labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'],
        values: [20, 35, 42, 38, 45, 52, 30],
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [420, 380, 510, 290, 470, 620, 550],
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [1850, 2100, 1950, 2340],
      },
      year: {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        values: [
          8200, 7900, 8400, 8100, 8600, 9000, 8700, 8900, 9200, 9500, 9800,
          9400,
        ],
      },
    };
    return trends[period] || trends['week'];
  }

  private generateTopWastedItems(multiplier: number): WastageItem[] {
    return [
      {
        name: 'Yogurt 500ml',
        amount: Math.round(340 * multiplier),
        reason: 'Expired',
        units: Math.round(68 * multiplier),
      },
      {
        name: 'Bread Loaf',
        amount: Math.round(280 * multiplier),
        reason: 'Damaged',
        units: Math.round(14 * multiplier),
      },
      {
        name: 'Fresh Salad',
        amount: Math.round(240 * multiplier),
        reason: 'Expired',
        units: Math.round(30 * multiplier),
      },
      {
        name: 'Tomatoes 1kg',
        amount: Math.round(180 * multiplier),
        reason: 'Overripe',
        units: Math.round(36 * multiplier),
      },
    ];
  }

  private generatePromotionData(
    multiplier: number,
    period: string,
  ): CompletePromotionData {
    return {
      active: this.generateActivePromotions(multiplier, period),
      performance: this.generatePromotionPerformance(period),
      summary: this.generatePromotionSummary(multiplier, period),
    };
  }

  private generateActivePromotions(
    multiplier: number,
    period: string,
  ): Promotion[] {
    return [
      {
        name: 'Buy 2 Get 1 Free',
        type: 'BOGO',
        status: 'active',
        redemptions: Math.round(342 * multiplier),
        revenue: Math.round(8420 * multiplier),
        endDate: '2025-02-28',
        discount: 33,
      },
      {
        name: '20% Off Dairy',
        type: 'Category Discount',
        status: 'active',
        redemptions: Math.round(189 * multiplier),
        revenue: Math.round(5230 * multiplier),
        endDate: '2025-02-15',
        discount: 20,
      },
      {
        name: 'Weekend Special',
        type: 'Time-based',
        status: 'active',
        redemptions: Math.round(521 * multiplier),
        revenue: Math.round(12400 * multiplier),
        endDate: '2025-02-09',
        discount: 15,
      },
      {
        name: 'Loyalty Points 2x',
        type: 'Loyalty',
        status: 'active',
        redemptions: Math.round(890 * multiplier),
        revenue: Math.round(18900 * multiplier),
        endDate: '2025-03-31',
        discount: 0,
      },
    ];
  }

  private generatePromotionPerformance(period: string): PromotionPerformance {
    const performances: Record<string, PromotionPerformance> = {
      today: {
        labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm'],
        redemptions: [45, 82, 120, 145, 168, 132],
        revenue: [1200, 2500, 3800, 4200, 5100, 3900],
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        redemptions: [820, 940, 1100, 890, 1200, 1450, 1320],
        revenue: [22000, 28000, 31000, 25000, 34000, 42000, 38000],
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        redemptions: [3800, 4200, 4800, 5100],
        revenue: [98000, 112000, 128000, 142000],
      },
      year: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        redemptions: [12500, 14800, 16200, 18500],
        revenue: [320000, 385000, 425000, 495000],
      },
    };
    return performances[period] || performances['week'];
  }

  private generatePromotionSummary(
    multiplier: number,
    period: string,
  ): PromotionSummary {
    return {
      totalPromos: 8,
      activePromos: 4,
      totalRedemptions: Math.round(1942 * multiplier),
      revenueImpact: Math.round(44950 * multiplier),
      avgDiscount: 17,
    };
  }

  // ─── existing public accessors (all unchanged) ────────────────────────────

  getDashboardMetrics(period: TimePeriod = 'today'): Observable<any> {
    return of(this.mockDataByPeriod[period].dashboard.metrics).pipe(delay(300));
  }

  getSalesTrend(period: TimePeriod = 'today'): Observable<any> {
    return of(this.mockDataByPeriod[period].dashboard.salesTrend).pipe(
      delay(300),
    );
  }

  getInsightsMetrics(period: TimePeriod = 'today'): Observable<any> {
    return of(this.mockDataByPeriod[period].insights.metrics).pipe(delay(300));
  }

  getProfitabilityData(period: TimePeriod = 'today'): Observable<any> {
    return of(this.mockDataByPeriod[period].insights.profitability).pipe(
      delay(300),
    );
  }

  getStorePerformance(period: TimePeriod = 'today'): Observable<any> {
    return of(this.mockDataByPeriod[period].insights.storePerformances).pipe(
      delay(300),
    );
  }

  getWastageData(
    period: TimePeriod = 'today',
  ): Observable<CompleteWastageData> {
    return of(this.mockDataByPeriod[period].wastageData!).pipe(delay(300));
  }

  getPromotionData(
    period: TimePeriod = 'today',
  ): Observable<CompletePromotionData> {
    return of(this.mockDataByPeriod[period].promotionData!).pipe(delay(300));
  }

  getCustomerData(
    period: TimePeriod = 'today',
  ): Observable<CompleteCustomerData> {
    console.log(
      'Fetching customer data for period:',
      this.mockDataByPeriod[period].customerData,
    );
    return of(this.mockDataByPeriod[period].customerData!).pipe(delay(300));
  }

  getInventoryAlerts(
    period: TimePeriod = 'today',
  ): Observable<InventoryAlert[]> {
    return of(this.mockDataByPeriod[period].dashboard.inventoryAlerts).pipe(
      delay(300),
    );
  }

  askAI(question: string, analytics: any) {
    console.log(analytics);
    return this.http.post<any>('/api/chat', { question, data: analytics });
  }
}
