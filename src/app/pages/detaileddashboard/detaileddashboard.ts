// detaileddashboard.ts
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  WidgetConfig,
  CompleteAnalytics,
  WidgetTopic,
  TimePeriod,
} from '../../models/analytics';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetService } from '../../services/widget.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopicFilterPipe } from '../../shared/topic-filter.pipe';
import { CustomerRetentionWidgetComponent } from '../../widgets/customer/customer-retention-widget.component';
import { CustomerSatisfactionWidgetComponent } from '../../widgets/customer/customer-satisfaction-widget.component';
import { CustomerSegmentsWidgetComponent } from '../../widgets/customer/customer-segments-widget.component';
import { TopCustomersWidgetComponent } from '../../widgets/customer/top-customers-widget.component';
import { InventoryAlertsWidgetComponent } from '../../widgets/inventory/inventory-alerts-widget.component';
import { StockLevelsWidgetComponent } from '../../widgets/inventory/stock-levels-widget.component';
import { TopBrandsWidgetComponent } from '../../widgets/inventory/top-brands-widget.component';
import { CategoryProfitWidgetComponent } from '../../widgets/profitability/category-profit-widget.component';
import { ProfitMarginWidgetComponent } from '../../widgets/profitability/profit-margin-widget.component';
import { ProfitOverviewWidgetComponent } from '../../widgets/profitability/profit-overview-widget.component';
import { StorePerformanceWidgetComponent } from '../../widgets/profitability/store-performance-widget.component';
import { ActivePromotionsWidgetComponent } from '../../widgets/promotions/active-promotions-widget.component';
import { PromoPerformanceWidgetComponent } from '../../widgets/promotions/promo-performance-widget.component';
import { PromoSummaryWidgetComponent } from '../../widgets/promotions/promo-summary-widget.component';
import { BranchPerformanceWidgetComponent } from '../../widgets/sales/branch-performance-widget.component';
import { PaymentMethodsWidgetComponent } from '../../widgets/sales/payment-methods-widget.component';
import { SalesMetricsWidgetComponent } from '../../widgets/sales/sales-metrics-widget.component';
import { SalesTrendWidgetComponent } from '../../widgets/sales/sales-trend-widget.component';
import { TopProductsWidgetComponent } from '../../widgets/sales/top-products-widget.component';
import { WastageByCategoryWidgetComponent } from '../../widgets/wastage/wastage-by-category-widget.component';
import { WastageSummaryWidgetComponent } from '../../widgets/wastage/wastage-summary-widget.component';
import { WastageTrendWidgetComponent } from '../../widgets/wastage/wastage-trend-widget.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { FilterService } from '../../services/filter.service';
import { DatePreset } from '../../models/filter.model';

@Component({
  selector: 'app-detaileddashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SalesMetricsWidgetComponent,
    SalesTrendWidgetComponent,
    TopProductsWidgetComponent,
    BranchPerformanceWidgetComponent,
    PaymentMethodsWidgetComponent,
    CustomerSegmentsWidgetComponent,
    TopCustomersWidgetComponent,
    CustomerRetentionWidgetComponent,
    CustomerSatisfactionWidgetComponent,
    InventoryAlertsWidgetComponent,
    StockLevelsWidgetComponent,
    TopBrandsWidgetComponent,
    ActivePromotionsWidgetComponent,
    PromoPerformanceWidgetComponent,
    PromoSummaryWidgetComponent,
    ProfitOverviewWidgetComponent,
    CategoryProfitWidgetComponent,
    StorePerformanceWidgetComponent,
    ProfitMarginWidgetComponent,
    WastageSummaryWidgetComponent,
    WastageTrendWidgetComponent,
    WastageByCategoryWidgetComponent,
    TopicFilterPipe,
    SidebarComponent,
    FilterBarComponent,
  ],
  templateUrl: './detaileddashboard.html',
  styleUrl: './detaileddashboard.css',
})
export class Detaileddashboard implements OnInit, OnDestroy {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  private destroy$ = new Subject<void>();

  selectedPeriod: TimePeriod = 'today';

  widgets: WidgetConfig[] = [];
  allWidgets: WidgetConfig[] = [];
  analytics: CompleteAnalytics | null = null;
  loading = true;
  today = new Date();

  showCustomizer = false;
  activeTopicFilter: WidgetTopic | 'all' = 'all';
  searchQuery = '';
  draggedWidget: WidgetConfig | null = null;
  dragOverIndex = -1;

  topics: { key: WidgetTopic; label: string; icon: string; color: string }[] = [
    { key: 'sales', label: 'Sales', icon: 'trending_up', color: '#6366f1' },
    { key: 'customer', label: 'Customer', icon: 'people', color: '#3b82f6' },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: 'inventory_2',
      color: '#0ea5e9',
    },
    {
      key: 'promotions',
      label: 'Promotions',
      icon: 'local_offer',
      color: '#10b981',
    },
    {
      key: 'profitability',
      label: 'Profitability',
      icon: 'account_balance',
      color: '#8b5cf6',
    },
    {
      key: 'wastage',
      label: 'Wastage',
      icon: 'delete_sweep',
      color: '#f59e0b',
    },
  ];

  //AI chatbot properties
  showChat = false;
  chatInput = '';
  chatLoading = false;
  chatMessages: { role: 'user' | 'ai'; content: string; time: Date }[] = [];
  quickPrompts = [
    'Which product sells best?',
    'How is customer retention?',
    'Show top performing branch',
    'Any inventory alerts?',
  ];

  constructor(
    public widgetService: WidgetService,
    private analyticsService: AnalyticsService,
    private filterService: FilterService,
  ) {}

  ngOnInit() {
    // Load initial data
    this.loadAnalytics(this.selectedPeriod);

    this.widgetService.widgets$
      .pipe(takeUntil(this.destroy$))
      .subscribe((widgets) => {
        this.allWidgets = widgets;
        this.widgets = widgets
          .filter((w) => w.visible)
          .sort((a, b) => a.order - b.order);
      });

    // Listen for date range changes from filter service
    this.filterService.dateRangeChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((preset) => {
        console.log('📅 Date range changed to:', preset);

        // Convert preset to TimePeriod
        const period = this.convertPresetToPeriod(preset);
        if (period && period !== this.selectedPeriod) {
          console.log('🔄 Loading data for period:', period);
          this.selectedPeriod = period;
          this.loadAnalytics(period);
        }
      });
  }

  // Convert DatePreset to TimePeriod
  private convertPresetToPeriod(preset: DatePreset): TimePeriod | null {
    switch (preset) {
      case 'today':
      case 'yesterday':
        return 'today';
      case 'last7days':
        return 'week';
      case 'last30days':
      case 'thisMonth':
      case 'lastMonth':
        return 'month';
      case 'thisYear':
      case 'lastYear':
        return 'year';
      default:
        return null;
    }
  }

  loadAnalytics(period: TimePeriod) {
    console.log('🟡 Dashboard.loadAnalytics:', period);
    this.loading = true;

    this.analyticsService
      .getCompleteAnalytics(period)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('✅ Analytics data loaded:', {
            period,
            salesTrendLabels: data?.dashboard?.salesTrend?.labels,
            salesTrendTotal: data?.dashboard?.salesTrend?.actualSales?.reduce(
              (a: number, b: number) => a + b,
              0,
            ),
          });

          // Create a new object reference to trigger change detection
          this.analytics = { ...data };
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error loading analytics:', error);
          this.loading = false;
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  AskAi() {
    this.analyticsService.getCompleteAnalytics().subscribe((data) => {
      this.analyticsService
        .askAI('Which product sells best?', data)
        .subscribe((res) => {
          console.log('Which product sells best?', res.answer);
        });
    });
  }

  sendQuickPrompt(prompt: string) {
    this.chatInput = prompt;
    this.sendChat();
  }

  sendChat() {
    const question = this.chatInput.trim();
    if (!question || this.chatLoading) return;

    this.chatMessages.push({
      role: 'user',
      content: question,
      time: new Date(),
    });
    this.chatInput = '';
    this.chatLoading = true;

    this.analyticsService.getCompleteAnalytics().subscribe((data) => {
      this.analyticsService.askAI(question, data).subscribe({
        next: (res) => {
          this.chatMessages.push({
            role: 'ai',
            content: res.answer,
            time: new Date(),
          });
          this.chatLoading = false;
        },
        error: () => {
          this.chatMessages.push({
            role: 'ai',
            content: "Sorry, I couldn't process that. Please try again.",
            time: new Date(),
          });
          this.chatLoading = false;
        },
      });
    });
  }

  // Update the period selector in your template
  changePeriod(period: TimePeriod) {
    console.log('🔵 Dashboard.changePeriod (manual):', period);
    this.selectedPeriod = period;

    // Update filter service with the new period
    let preset: DatePreset;
    switch (period) {
      case 'today':
        preset = 'today';
        break;
      case 'week':
        preset = 'last7days';
        break;
      case 'month':
        preset = 'thisMonth';
        break;
      case 'year':
        preset = 'thisYear';
        break;
      default:
        preset = 'last7days';
    }

    // Update filter service - this will trigger dateRangeChanged$
    this.filterService.updateDateRange(preset);

    // Load analytics data
    this.loadAnalytics(period);
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  get isExpanded(): boolean {
    return this.sidebar ? this.sidebar.isExpanded : true;
  }

  get filteredCustomizerWidgets(): WidgetConfig[] {
    return this.allWidgets.filter((w) => {
      const topicMatch =
        this.activeTopicFilter === 'all' || w.topic === this.activeTopicFilter;
      const searchMatch =
        !this.searchQuery ||
        w.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      return topicMatch && searchMatch;
    });
  }

  toggleWidget(id: string) {
    this.widgetService.toggleWidget(id);
  }

  getVisibleWidgetsByTopic(topic: WidgetTopic): WidgetConfig[] {
    return this.widgets.filter((w) => w.topic === topic);
  }

  getTopicColor(topic: WidgetTopic): string {
    return this.topics.find((t) => t.key === topic)?.color || '#6366f1';
  }

  getTopicLabel(topic: WidgetTopic): string {
    return this.topics.find((t) => t.key === topic)?.label || topic;
  }

  getVisibleCount(topic: WidgetTopic): number {
    return this.allWidgets.filter((w) => w.topic === topic && w.visible).length;
  }

  getTotalCount(topic: WidgetTopic): number {
    return this.allWidgets.filter((w) => w.topic === topic).length;
  }

  // Drag and drop methods...
  onDragStart(event: DragEvent, widget: WidgetConfig) {
    this.draggedWidget = widget;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', widget.id);
    }
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    this.dragOverIndex = index;
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onDragLeave() {
    this.dragOverIndex = -1;
  }

  onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    if (!this.draggedWidget) return;
    const sourceIndex = this.widgets.findIndex(
      (w) => w.id === this.draggedWidget!.id,
    );
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      this.draggedWidget = null;
      this.dragOverIndex = -1;
      return;
    }
    const newOrder = [...this.widgets];
    const [moved] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, moved);
    this.widgetService.reorderWidgets(newOrder);
    this.draggedWidget = null;
    this.dragOverIndex = -1;
  }

  onDragEnd() {
    this.draggedWidget = null;
    this.dragOverIndex = -1;
  }

  resetWidgets() {
    this.widgetService.resetToDefault();
  }

  trackByWidget(_: number, widget: WidgetConfig) {
    return widget.id;
  }
}
