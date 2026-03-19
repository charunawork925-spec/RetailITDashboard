// models/filter-state.model.ts

export type TopicId =
  | 'sales'
  | 'customer'
  | 'inventory'
  | 'profitability'
  | 'wastage';

export interface DrillLevel {
  label: string;
  context: string;
}

export interface FilterState {
  topic: TopicId;
  filters: Record<string, string[]>; // { branch: ['Uptown','Mall'], segment: ['Premium'] }
  drillStack: DrillLevel[]; // breadcrumb trail — grows with each drill
}

export interface FilterDefinition {
  id: string;
  label: string;
  options: string[];
}

export interface ActiveFilterChip {
  filterId: string;
  value: string;
  displayLabel: string;
}

export interface FilterContext {
  topic: TopicId;
  filters: Record<string, string[]>;
  drillLevel: number;
  drillContext: string[]; // e.g. ['category', 'product']
}

// Drill level definitions per topic
export const DRILL_CONFIGS: Record<TopicId, DrillLevel[]> = {
  sales: [
    { label: 'Overview', context: 'root' },
    { label: 'By Category', context: 'category' },
    { label: 'By Product', context: 'product' },
  ],
  customer: [
    { label: 'Overview', context: 'root' },
    { label: 'By Segment', context: 'segment' },
    { label: 'By Customer', context: 'customer' },
  ],
  inventory: [
    { label: 'Overview', context: 'root' },
    { label: 'By Category', context: 'category' },
    { label: 'By SKU', context: 'sku' },
  ],
  profitability: [
    { label: 'Overview', context: 'root' },
    { label: 'By Category', context: 'category' },
    { label: 'By Product', context: 'product' },
  ],
  wastage: [
    { label: 'Overview', context: 'root' },
    { label: 'By Category', context: 'category' },
    { label: 'By Item', context: 'item' },
  ],
};

// Filter definitions per topic — drives the sidebar dynamically
export const FILTER_DEFINITIONS: Record<TopicId, FilterDefinition[]> = {
  sales: [
    {
      id: 'period',
      label: 'Period',
      options: ['Today', 'This Week', 'This Month', 'This Year'],
    },
    {
      id: 'branch',
      label: 'Branch',
      options: ['Downtown', 'Uptown', 'Suburb', 'Mall'],
    },
    {
      id: 'payment',
      label: 'Payment Method',
      options: ['Card', 'Cash', 'Digital Wallet'],
    },
    {
      id: 'category',
      label: 'Product Category',
      options: ['Dairy', 'FMCG', 'Grocery', 'Beverages', 'Household'],
    },
    {
      id: 'customerType',
      label: 'Customer Type',
      options: ['Premium', 'Regular', 'Occasional', 'New'],
    },
  ],
  customer: [
    {
      id: 'period',
      label: 'Period',
      options: ['Today', 'This Week', 'This Month', 'This Year'],
    },
    {
      id: 'segment',
      label: 'Customer Segment',
      options: ['Premium', 'Regular', 'Occasional', 'New'],
    },
    {
      id: 'branch',
      label: 'Branch',
      options: ['Downtown', 'Uptown', 'Suburb', 'Mall'],
    },
    {
      id: 'retention',
      label: 'Retention Status',
      options: ['Active', 'At Risk', 'Churned'],
    },
  ],
  inventory: [
    {
      id: 'branch',
      label: 'Branch',
      options: ['Downtown', 'Uptown', 'Suburb', 'Mall'],
    },
    {
      id: 'category',
      label: 'Category',
      options: ['Dairy', 'Bakery', 'Produce', 'Beverages', 'Meat'],
    },
    {
      id: 'status',
      label: 'Stock Status',
      options: ['Critical', 'Warning', 'Low', 'Normal'],
    },
  ],
  profitability: [
    {
      id: 'period',
      label: 'Period',
      options: ['Today', 'This Week', 'This Month', 'This Year'],
    },
    {
      id: 'category',
      label: 'Category',
      options: [
        'Hardware',
        'Food Partners',
        'Specialty Tea',
        'Electronics',
        'Stationery',
      ],
    },
    {
      id: 'branch',
      label: 'Branch',
      options: ['Downtown', 'Uptown', 'Suburb', 'Mall'],
    },
    {
      id: 'margin',
      label: 'Margin Range',
      options: ['> 40%', '30–40%', '20–30%', '< 20%'],
    },
  ],
  wastage: [
    {
      id: 'period',
      label: 'Period',
      options: ['Today', 'This Week', 'This Month', 'This Year'],
    },
    {
      id: 'category',
      label: 'Category',
      options: ['Dairy', 'Produce', 'Bakery', 'Meat'],
    },
    {
      id: 'reason',
      label: 'Reason',
      options: ['Expired', 'Damaged', 'Overripe'],
    },
    {
      id: 'branch',
      label: 'Branch',
      options: ['Downtown', 'Uptown', 'Suburb', 'Mall'],
    },
  ],
};
