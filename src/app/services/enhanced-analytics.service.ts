// enhanced-analytics.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay, from } from 'rxjs';
import { CompleteAnalytics } from '../models/analytics';

@Injectable({
  providedIn: 'root'
})
export class EnhancedAnalyticsService {
  private baseData: CompleteAnalytics;

  constructor() {
    // Initialize with your existing mock data
    this.baseData = {
      dashboard: {
        metrics: {  todaySales: {
          label: "Today's Sales",
          value: 'Rs. 24,563',
          change: 13.5,
          changeLabel: '+13.5%'
        },
        transactions: {
          label: 'Transactions',
          value: 1429,
          change: 4.2,
          changeLabel: '+4.2%'
        },
        avgBillValue: {
          label: 'Avg Bill Value',
          value: 'Rs. 17.19',
          change: -3.2,
          changeLabel: '-3.2%'
        },
        paymentSplit: {
          label: 'Payment Split',
          value: '65/35',
          change: 0,
          changeLabel: 'Card/Cash'
        } },
        salesTrend: {  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        actualSales: [320, 280, 310, 270, 350, 380, 340, 400, 420, 460, 490, 450]
       },
        topProducts: [],
        topCustomers: [],
        topBrands: [],
        inventoryAlerts: [],
        paymentMethods: [],
        branches: []
      },
      insights: {
        metrics: {   revenueGrowth: {
          label: 'Revenue Growth',
          value: '+12.5%',
          change: 12.5
        },
        avgProfitMargin: {
          label: 'Avg Profit Margin',
          value: '34.2%',
          change: 2.8
        },
        salesRepTransaction: {
          label: 'Sales Rep Transaction',
          value: '3.8',
          change: -0.6
        },
        avgDays: {
          label: '18 days',
          value: '18 days',
          change: 0
        }},
        dailySales: {  labels: ['Jan 01', 'Jan 02', 'Jan 03', 'Jan 04', 'Jan 05', 'Jan 06', 'Jan 07', 'Jan 08', 'Jan 09', 'Jan 10'],
        actualSales: [280, 320, 310, 290, 380, 400, 360, 450, 480, 430],
        target: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300],
        bestDay: 'Jan 09',
        bestDayValue: 480,
        recentDay: 'Jan 14',
        recentDayRevenue: 35000,
        avgDailySales: 377 },
        recentSalesPattern: {  labels: ['Past 1Mo', 'Past 2Mo', 'Past 3Mo', 'Past 4Mo', 'Past 5Mo', 'Past 6Mo', 'Past 7Mo', 'Past 8Mo'],
        values: [420, 450, 480, 520, 490, 540, 580, 610],
        maxValue: 610,
        status: 'up' },
        profitability: [],
        bestSellingProducts: [],
        productRecommendations: [],
        storePerformances: []
      }
    };
  }

  // Dynamic data generation based on topic and filters
  getAnalyticsData(topic: string, filters?: any): Observable<any> {
    switch (topic) {
      case 'sales':
        return this.getSalesAnalytics(filters);
      case 'customers':
        return this.getCustomerAnalytics(filters);
      case 'inventory':
        return this.getInventoryAnalytics(filters);
      case 'promotion':
        return this.getPromotionAnalytics(filters);
      case 'profitability':
        return this.getProfitabilityAnalytics(filters);
      case 'wastage':
        return this.getWastageAnalytics(filters);
      default:
        return of(null);
    }
  }

  private getSalesAnalytics(filters?: any): Observable<any> {
    // Simulate dynamic data based on filters
    const data = {
      metrics: [
        { label: 'Total Sales', value: this.randomNumber(10000, 100000), change: this.randomNumber(-20, 20) },
        { label: 'Average Order Value', value: this.randomNumber(50, 500), change: this.randomNumber(-10, 10) },
        { label: 'Conversion Rate', value: `${this.randomNumber(2, 8)}%`, change: this.randomNumber(-5, 5) },
        { label: 'Repeat Customers', value: `${this.randomNumber(20, 80)}%`, change: this.randomNumber(-10, 10) }
      ],
      trends: {
        labels: this.generateDateLabels(7),
        data: Array.from({ length: 7 }, () => this.randomNumber(1000, 10000))
      },
      topProducts: Array.from({ length: 5 }, (_, i) => ({
        rank: i + 1,
        name: `Product ${String.fromCharCode(65 + i)}`,
        sales: this.randomNumber(1000, 5000),
        change: this.randomNumber(-30, 30)
      }))
    };
    return of(data).pipe(delay(300));
  }

  private getCustomerAnalytics(filters?: any): Observable<any> {
    const data = {
      metrics: [
        { label: 'Total Customers', value: this.randomNumber(100, 1000), change: this.randomNumber(5, 20) },
        { label: 'New Customers', value: this.randomNumber(10, 100), change: this.randomNumber(-10, 30) },
        { label: 'Customer Lifetime Value', value: `$${this.randomNumber(100, 1000)}`, change: this.randomNumber(-5, 15) },
        { label: 'Retention Rate', value: `${this.randomNumber(60, 95)}%`, change: this.randomNumber(-3, 8) }
      ],
      segments: [
        { name: 'Regular', percentage: 60, value: this.randomNumber(100, 500) },
        { name: 'Premium', percentage: 25, value: this.randomNumber(200, 800) },
        { name: 'New', percentage: 15, value: this.randomNumber(50, 150) }
      ],
      topCustomers: Array.from({ length: 5 }, (_, i) => ({
        name: `Customer ${i + 1}`,
        totalSpent: this.randomNumber(500, 5000),
        orders: this.randomNumber(5, 50),
        lastPurchase: this.randomDate(new Date(2024, 0, 1), new Date())
      }))
    };
    return of(data).pipe(delay(300));
  }

  private getInventoryAnalytics(filters?: any): Observable<any> {
    const data = {
      metrics: [
        { label: 'Total Stock Value', value: `$${this.randomNumber(50000, 200000)}`, change: this.randomNumber(-10, 10) },
        { label: 'Stock Turnover', value: `${this.randomNumber(2, 12)}x`, change: this.randomNumber(-2, 5) },
        { label: 'Out of Stock Items', value: this.randomNumber(0, 20), change: this.randomNumber(-5, 5) },
        { label: 'Excess Stock', value: this.randomNumber(5, 50), change: this.randomNumber(-10, 10) }
      ],
      alerts: Array.from({ length: 5 }, (_, i) => ({
        product: `Product ${String.fromCharCode(65 + i)}`,
        currentStock: this.randomNumber(0, 100),
        minStock: 20,
        status: ['low', 'critical', 'ok', 'excess'][i % 4] as any
      })),
      turnover: {
        labels: this.generateDateLabels(6, 'month'),
        fastMoving: Array.from({ length: 6 }, () => this.randomNumber(70, 95)),
        slowMoving: Array.from({ length: 6 }, () => this.randomNumber(20, 50))
      }
    };
    return of(data).pipe(delay(300));
  }

  private getPromotionAnalytics(filters?: any): Observable<any> {
    const data = {
      metrics: [
        { label: 'Promotion ROI', value: `${this.randomNumber(150, 500)}%`, change: this.randomNumber(-50, 100) },
        { label: 'Promotion Sales', value: `$${this.randomNumber(5000, 50000)}`, change: this.randomNumber(-20, 40) },
        { label: 'Customer Acquisition', value: this.randomNumber(50, 500), change: this.randomNumber(-10, 30) },
        { label: 'Redemption Rate', value: `${this.randomNumber(10, 60)}%`, change: this.randomNumber(-5, 15) }
      ],
      promotions: Array.from({ length: 4 }, (_, i) => ({
        name: `Promotion ${i + 1}`,
        type: ['Discount', 'Bundle', 'Loyalty', 'Clearance'][i],
        salesIncrease: `${this.randomNumber(10, 100)}%`,
        roi: `${this.randomNumber(120, 400)}%`,
        status: ['active', 'completed', 'planned', 'active'][i]
      }))
    };
    return of(data).pipe(delay(300));
  }

  private getProfitabilityAnalytics(filters?: any): Observable<any> {
    const data = {
      metrics: [
        { label: 'Gross Margin', value: `${this.randomNumber(20, 60)}%`, change: this.randomNumber(-5, 5) },
        { label: 'Net Profit', value: `$${this.randomNumber(10000, 100000)}`, change: this.randomNumber(-10, 15) },
        { label: 'Operating Margin', value: `${this.randomNumber(10, 40)}%`, change: this.randomNumber(-3, 7) },
        { label: 'Return on Assets', value: `${this.randomNumber(5, 25)}%`, change: this.randomNumber(-2, 4) }
      ],
      byCategory: [
        { category: 'Electronics', profit: this.randomNumber(50000, 200000), margin: this.randomNumber(25, 45) },
        { category: 'Clothing', profit: this.randomNumber(30000, 150000), margin: this.randomNumber(30, 60) },
        { category: 'Food', profit: this.randomNumber(20000, 100000), margin: this.randomNumber(15, 35) },
        { category: 'Home', profit: this.randomNumber(25000, 120000), margin: this.randomNumber(20, 40) }
      ]
    };
    return of(data).pipe(delay(300));
  }

  private getWastageAnalytics(filters?: any): Observable<any> {
    const data = {
      metrics: [
        { label: 'Total Wastage', value: `$${this.randomNumber(1000, 10000)}`, change: this.randomNumber(-20, 10) },
        { label: 'Wastage Rate', value: `${this.randomNumber(1, 10)}%`, change: this.randomNumber(-3, 3) },
        { label: 'Savings Opportunity', value: `$${this.randomNumber(5000, 50000)}`, change: this.randomNumber(10, 50) },
        { label: 'Items Wasted', value: this.randomNumber(50, 500), change: this.randomNumber(-15, 5) }
      ],
      byCategory: [
        { category: 'Perishables', wastage: this.randomNumber(1000, 5000), percentage: this.randomNumber(30, 60) },
        { category: 'Seasonal', wastage: this.randomNumber(500, 3000), percentage: this.randomNumber(15, 40) },
        { category: 'Damaged', wastage: this.randomNumber(200, 2000), percentage: this.randomNumber(5, 25) },
        { category: 'Expired', wastage: this.randomNumber(100, 1500), percentage: this.randomNumber(10, 30) }
      ]
    };
    return of(data).pipe(delay(300));
  }

  // Helper methods
  private randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private generateDateLabels(count: number, type: 'day' | 'month' = 'day'): string[] {
    const labels = [];
    const now = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date();
      if (type === 'day') {
        date.setDate(now.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      } else {
        date.setMonth(now.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      }
    }
    
    return labels;
  }
}