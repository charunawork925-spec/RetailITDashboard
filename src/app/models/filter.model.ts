// models/filter.models.ts
export interface FilterState {
  dateRange: DateRange;
  comparison: ComparisonType;
  customerType: CustomerTypeFilter;
  productCategory: ProductCategoryFilter;
  branch: BranchFilter;
  paymentMethod: PaymentMethodFilter;
  timeOfDay: TimeOfDayFilter;
  dayOfWeek: DayOfWeekFilter;
  promotionType: PromotionTypeFilter;
  storePerformance: StorePerformanceFilter;
  inventoryStatus: InventoryStatusFilter;
  wastageCategory: WastageCategoryFilter;
  customerId: string; // ADD THIS
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
  preset: DatePreset;
}

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

export type ComparisonType =
  | 'none'
  | 'previous_period'
  | 'previous_year'
  | 'target';

export type CustomerTypeFilter =
  | 'all'
  | 'premium'
  | 'regular'
  | 'occasional'
  | 'new';

export type ProductCategoryFilter =
  | 'all'
  | 'dairy'
  | 'fmcg'
  | 'grocery'
  | 'beverages'
  | 'household'
  | 'electronics'
  | 'apparel';

export type BranchFilter =
  | 'all'
  | 'downtown'
  | 'uptown'
  | 'suburb'
  | 'mall'
  | 'kelaniya'
  | 'dehiwala'
  | 'galle'
  | 'negombo';

export type PaymentMethodFilter = 'all' | 'card' | 'cash' | 'digital';

export type TimeOfDayFilter =
  | 'all'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night';

export type DayOfWeekFilter =
  | 'all'
  | 'weekday'
  | 'weekend'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type PromotionTypeFilter =
  | 'all'
  | 'bogo'
  | 'category_discount'
  | 'time_based'
  | 'loyalty';

export type StorePerformanceFilter =
  | 'all'
  | 'excellent'
  | 'good'
  | 'average'
  | 'poor';

export type InventoryStatusFilter =
  | 'all'
  | 'critical'
  | 'warning'
  | 'low'
  | 'healthy';

export type WastageCategoryFilter =
  | 'all'
  | 'dairy'
  | 'produce'
  | 'bakery'
  | 'meat';

export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface FilterContext {
  widgetId: string;
  widgetTopic: string;
  filterTypes: string[];
}
