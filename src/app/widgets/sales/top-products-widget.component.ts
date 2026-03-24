import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';
import { BaseFilteredWidgetComponent } from '../../shared/base-filtered-widget.component';
import { FilterService } from '../../services/filter.service';
import { FilterState } from '../../models/filter.model';

@Component({
  selector: 'app-top-products-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper
      title="Top Products"
      icon="star"
      [showFilters]="true"
      [hasActiveFilters]="hasActiveFilters()"
      [activeFilterCount]="getActiveFilterCount()"
      [activeFiltersTooltip]="getActiveFiltersTooltip()"
      [activeFilters]="getActiveFilters()"
    >
      <div class="product-list">
        <div class="product-row" *ngFor="let p of filteredData">
          <div class="rank">#{{ p.rank }}</div>
          <div class="product-info">
            <div class="product-name">{{ p.name }}</div>
            <div class="product-cat">{{ p.category }}</div>
          </div>
          <div class="product-right">
            <div class="product-amount">Rs. {{ p.amount | number }}</div>
            <div
              class="product-change"
              [class.up]="p.change > 0"
              [class.down]="p.change < 0"
            >
              <span class="material-icons">{{
                p.change > 0 ? 'arrow_upward' : 'arrow_downward'
              }}</span>
              {{ p.change | number: '1.1-1' }}%
            </div>
          </div>
        </div>
        <div class="no-data" *ngIf="filteredData.length === 0">
          No products match the selected filters
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .product-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .product-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .rank {
        font-size: 13px;
        font-weight: 800;
        color: #6366f1;
        width: 24px;
        flex-shrink: 0;
      }
      .product-info {
        flex: 1;
        min-width: 0;
      }
      .product-name {
        font-size: 13px;
        font-weight: 600;
        color: #7c879b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .product-cat {
        font-size: 11px;
        color: #8892a4;
        margin-top: 2px;
      }
      .product-right {
        text-align: right;
        flex-shrink: 0;
      }
      .product-amount {
        font-size: 13px;
        font-weight: 700;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
      }
      .product-change {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 11px;
        font-weight: 600;
        gap: 2px;
        .material-icons {
          font-size: 12px;
        }
        &.up {
          color: #10b981;
        }
        &.down {
          color: #ef4444;
        }
      }
      .no-data {
        text-align: center;
        padding: 32px;
        color: #8892a4;
        font-size: 13px;
      }
    `,
  ],
})
export class TopProductsWidgetComponent
  extends BaseFilteredWidgetComponent
  implements OnInit
{
  @Input() override data: any[] = [];
  @Input() override widgetId: string = 'top-products';

  filteredData: any[] = [];
  private originalData: any[] = [];

  constructor(filterService: FilterService) {
    super(filterService);
  }

  override ngOnInit() {
    super.ngOnInit();
    if (this.originalData.length > 0) {
      this.applyFilters(this.filterState);
    }
  }

  override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    if (changes['data'] && this.data) {
      this.originalData = [...this.data];
      if (this.filterState) {
        this.applyFilters(this.filterState);
      } else {
        this.filteredData = this.originalData;
      }
    }
  }

  protected override onFiltersChanged(filters: FilterState) {
    if (filters && this.originalData.length > 0) {
      this.applyFilters(filters);
    }
  }

  private applyFilters(filters: FilterState) {
    if (!filters) {
      console.warn('TopProductsWidget: No filter state available');
      this.filteredData = this.originalData;
      return;
    }

    let products = [...this.originalData];

    // Apply each filter, collecting both amount and change modifications
    if (
      this.shouldApplyFilter('branch') &&
      filters.branch &&
      filters.branch !== 'all'
    ) {
      products = this.filterByBranch(products, filters.branch);
    }

    if (
      this.shouldApplyFilter('customerType') &&
      filters.customerType &&
      filters.customerType !== 'all'
    ) {
      products = this.filterByCustomerType(products, filters.customerType);
    }

    if (
      this.shouldApplyFilter('productCategory') &&
      filters.productCategory &&
      filters.productCategory !== 'all'
    ) {
      products = this.filterByProductCategory(
        products,
        filters.productCategory,
      );
    }

    if (
      this.shouldApplyFilter('customerId') &&
      filters.customerId &&
      filters.customerId !== 'all'
    ) {
      products = this.filterByCustomer(products, filters.customerId);
    }

    if (
      this.shouldApplyFilter('paymentMethod') &&
      filters.paymentMethod &&
      filters.paymentMethod !== 'all'
    ) {
      products = this.filterByPaymentMethod(products, filters.paymentMethod);
    }

    if (
      this.shouldApplyFilter('timeOfDay') &&
      filters.timeOfDay &&
      filters.timeOfDay !== 'all'
    ) {
      products = this.filterByTimeOfDay(products, filters.timeOfDay);
    }

    if (
      this.shouldApplyFilter('dayOfWeek') &&
      filters.dayOfWeek &&
      filters.dayOfWeek !== 'all'
    ) {
      products = this.filterByDayOfWeek(products, filters.dayOfWeek);
    }

    // Re-sort and re-rank after all filters
    products = this.sortAndRankProducts(products);
    this.filteredData = products;
  }

  private filterByBranch(products: any[], branch: string): any[] {
    try {
      // Branch-specific multipliers for both amount and growth
      const branchConfig: Record<
        string,
        { amountMultiplier: number; growthModifier: number }
      > = {
        downtown: { amountMultiplier: 1.2, growthModifier: 1.15 }, // 15% higher growth
        uptown: { amountMultiplier: 1.1, growthModifier: 1.1 }, // 10% higher growth
        suburb: { amountMultiplier: 0.8, growthModifier: 0.7 }, // 30% lower growth
        mall: { amountMultiplier: 1.0, growthModifier: 1.0 }, // baseline growth
        kelaniya: { amountMultiplier: 0.9, growthModifier: 0.85 }, // 15% lower growth
        dehiwala: { amountMultiplier: 0.95, growthModifier: 0.9 }, // 10% lower growth
        galle: { amountMultiplier: 0.7, growthModifier: 0.6 }, // 40% lower growth
        negombo: { amountMultiplier: 0.85, growthModifier: 0.8 }, // 20% lower growth
      };

      const config = branchConfig[branch] || {
        amountMultiplier: 1.0,
        growthModifier: 1.0,
      };

      return products.map((product) => ({
        ...product,
        amount: Math.round(product.amount * config.amountMultiplier),
        change: product.change * config.growthModifier, // ✅ Percentage changes too!
      }));
    } catch (error) {
      console.error('Error in filterByBranch:', error);
      return products;
    }
  }

  private filterByCustomerType(products: any[], customerType: string): any[] {
    try {
      // Different customer types have different growth patterns
      const typeConfig: Record<
        string,
        { amountMultiplier: number; growthModifier: number }
      > = {
        premium: { amountMultiplier: 1.3, growthModifier: 1.25 }, // Premium customers grow faster
        regular: { amountMultiplier: 1.0, growthModifier: 1.0 }, // Baseline
        occasional: { amountMultiplier: 0.7, growthModifier: 0.8 }, // Lower growth
        new: { amountMultiplier: 0.5, growthModifier: 1.5 }, // New customers have high growth rate
      };

      const config = typeConfig[customerType] || {
        amountMultiplier: 1.0,
        growthModifier: 1.0,
      };

      return products.map((product) => ({
        ...product,
        amount: Math.round(product.amount * config.amountMultiplier),
        change: product.change * config.growthModifier, // ✅ Percentage changes updated
      }));
    } catch (error) {
      console.error('Error in filterByCustomerType:', error);
      return products;
    }
  }

  private filterByProductCategory(products: any[], category: string): any[] {
    try {
      // Category-specific performance
      const categoryConfig: Record<
        string,
        { amountMultiplier: number; growthModifier: number }
      > = {
        dairy: { amountMultiplier: 1.0, growthModifier: 1.05 },
        fmcg: { amountMultiplier: 0.9, growthModifier: 0.95 },
        grocery: { amountMultiplier: 0.85, growthModifier: 0.9 },
        beverages: { amountMultiplier: 0.8, growthModifier: 1.1 }, // Beverages growing faster
        household: { amountMultiplier: 0.7, growthModifier: 0.85 },
        electronics: { amountMultiplier: 0.6, growthModifier: 1.2 }, // Electronics high growth
        apparel: { amountMultiplier: 0.5, growthModifier: 0.8 },
      };

      const config = categoryConfig[category] || {
        amountMultiplier: 1.0,
        growthModifier: 1.0,
      };

      // Filter to only show products from the selected category
      let filteredProducts = products.filter(
        (product) =>
          product.category?.toLowerCase() === category ||
          this.isProductInCategory(product, category),
      );

      if (filteredProducts.length === 0) {
        return [];
      }

      return filteredProducts.map((product) => ({
        ...product,
        amount: Math.round(product.amount * config.amountMultiplier),
        change: product.change * config.growthModifier, // ✅ Category-specific growth
      }));
    } catch (error) {
      console.error('Error in filterByProductCategory:', error);
      return products;
    }
  }

  private filterByCustomer(products: any[], customerId: string): any[] {
    try {
      // Individual customer preferences and growth patterns
      const customerConfig: Record<
        string,
        {
          preferences: string[];
          amountMultiplier: number;
          growthModifier: number;
        }
      > = {
        'Scott Fernando': {
          preferences: ['Fresh Milk 1L', 'Coffee 100g'],
          amountMultiplier: 0.05,
          growthModifier: 1.2, // This customer's spending is growing
        },
        'Rowen Silva': {
          preferences: ['Cold Powder 100g', 'Cooking Oil 1L'],
          amountMultiplier: 0.05,
          growthModifier: 0.95, // Slight decline
        },
        'Hasini Wijeratne': {
          preferences: ['Fresh Milk 1L', 'Dahl Wash Liquid 500ml'],
          amountMultiplier: 0.05,
          growthModifier: 1.1, // Growing
        },
        'Chathurika Fernandes': {
          preferences: ['Coffee 100g', 'Cooking Oil 1L'],
          amountMultiplier: 0.05,
          growthModifier: 1.15, // High growth (new customer)
        },
        'Demal Perera': {
          preferences: ['Fresh Milk 1L', 'Cold Powder 100g'],
          amountMultiplier: 0.05,
          growthModifier: 1.05, // Steady growth
        },
      };

      const config = customerConfig[customerId] || {
        preferences: [],
        amountMultiplier: 0.05,
        growthModifier: 1.0,
      };

      return products.map((product) => {
        const isPreferred = config.preferences.includes(product.name);
        const multiplier = isPreferred
          ? config.amountMultiplier * 2
          : config.amountMultiplier;

        return {
          ...product,
          amount: Math.round(product.amount * multiplier),
          change: product.change * config.growthModifier, // ✅ Customer-specific growth
        };
      });
    } catch (error) {
      console.error('Error in filterByCustomer:', error);
      return products;
    }
  }

  private filterByPaymentMethod(products: any[], paymentMethod: string): any[] {
    try {
      // Different payment methods have different growth trends
      const methodConfig: Record<
        string,
        { amountMultiplier: number; growthModifier: number }
      > = {
        card: { amountMultiplier: 0.65, growthModifier: 1.1 }, // Card payments growing
        cash: { amountMultiplier: 0.26, growthModifier: 0.9 }, // Cash declining
        digital: { amountMultiplier: 0.09, growthModifier: 1.5 }, // Digital payments growing fast
      };

      const config = methodConfig[paymentMethod] || {
        amountMultiplier: 1.0,
        growthModifier: 1.0,
      };

      return products.map((product) => ({
        ...product,
        amount: Math.round(product.amount * config.amountMultiplier),
        change: product.change * config.growthModifier, // ✅ Payment method growth
      }));
    } catch (error) {
      console.error('Error in filterByPaymentMethod:', error);
      return products;
    }
  }

  private filterByTimeOfDay(products: any[], timeOfDay: string): any[] {
    try {
      // Time-based product performance
      const timeConfig: Record<
        string,
        Record<string, { amountMultiplier: number; growthModifier: number }>
      > = {
        morning: {
          'Coffee 100g': { amountMultiplier: 1.5, growthModifier: 1.3 },
          'Fresh Milk 1L': { amountMultiplier: 1.3, growthModifier: 1.2 },
          'Bread Loaf': { amountMultiplier: 1.4, growthModifier: 1.25 },
          default: { amountMultiplier: 0.7, growthModifier: 0.8 },
        },
        afternoon: {
          'Cold Powder 100g': { amountMultiplier: 1.4, growthModifier: 1.2 },
          'Soft Drinks': { amountMultiplier: 1.3, growthModifier: 1.15 },
          default: { amountMultiplier: 0.9, growthModifier: 0.95 },
        },
        evening: {
          'Cooking Oil 1L': { amountMultiplier: 1.2, growthModifier: 1.1 },
          'Fresh Milk 1L': { amountMultiplier: 1.1, growthModifier: 1.05 },
          default: { amountMultiplier: 1.0, growthModifier: 1.0 },
        },
        night: {
          Snacks: { amountMultiplier: 1.5, growthModifier: 1.4 },
          Beverages: { amountMultiplier: 1.3, growthModifier: 1.25 },
          default: { amountMultiplier: 0.5, growthModifier: 0.6 },
        },
      };

      const timePattern = timeConfig[timeOfDay] || {
        default: { amountMultiplier: 1.0, growthModifier: 1.0 },
      };

      return products.map((product) => {
        const productConfig =
          timePattern[product.name] || timePattern['default'];
        return {
          ...product,
          amount: Math.round(product.amount * productConfig.amountMultiplier),
          change: product.change * productConfig.growthModifier, // ✅ Time-based growth
        };
      });
    } catch (error) {
      console.error('Error in filterByTimeOfDay:', error);
      return products;
    }
  }

  private filterByDayOfWeek(products: any[], dayOfWeek: string): any[] {
    try {
      const isWeekend =
        dayOfWeek === 'weekend' ||
        dayOfWeek === 'saturday' ||
        dayOfWeek === 'sunday';

      // Weekend vs weekday performance
      const config = isWeekend
        ? { amountMultiplier: 1.3, growthModifier: 1.2 } // Weekend: higher sales, higher growth
        : { amountMultiplier: 0.9, growthModifier: 0.95 }; // Weekday: lower baseline, slightly lower growth

      return products.map((product) => ({
        ...product,
        amount: Math.round(product.amount * config.amountMultiplier),
        change: product.change * config.growthModifier, // ✅ Day-based growth
      }));
    } catch (error) {
      console.error('Error in filterByDayOfWeek:', error);
      return products;
    }
  }

  private sortAndRankProducts(products: any[]): any[] {
    const sorted = [...products].sort((a, b) => b.amount - a.amount);
    return sorted.map((product, index) => ({
      ...product,
      rank: index + 1,
    }));
  }

  private isProductInCategory(product: any, category: string): boolean {
    const categoryKeywords: Record<string, string[]> = {
      dairy: ['Milk', 'Yogurt', 'Butter', 'Cheese'],
      fmcg: ['Cold Powder', 'Soap', 'Shampoo'],
      grocery: ['Oil', 'Rice', 'Flour'],
      beverages: ['Coffee', 'Tea', 'Juice'],
      household: ['Wash', 'Cleaner', 'Detergent'],
      electronics: ['Headphones', 'Charger', 'Cable'],
      apparel: ['Shirt', 'Pants', 'Dress'],
    };

    const keywords = categoryKeywords[category] || [];
    return keywords.some((keyword) =>
      product.name?.toLowerCase().includes(keyword.toLowerCase()),
    );
  }
}
