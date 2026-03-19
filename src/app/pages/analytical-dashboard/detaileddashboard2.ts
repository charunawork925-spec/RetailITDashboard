// detaileddashboard.ts — UPDATED with filter system

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  WidgetConfig,
  CompleteAnalytics,
  WidgetTopic,
  TimePeriod,
} from '../../models/analytics';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetService } from '../../services/widget.service';
import { FilterStateService } from '../../services/filter-state.service';

// New filter components
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { DrillBreadcrumbComponent } from '../../components/drill-breadcrumb/drill-breadcrumb.component';
import { ActiveFilterBarComponent } from '../../components/active-filter-bar/active-filter-bar.component';

// Existing widget imports
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
import { SalesTrendWidgetComponent } from '../../widget/sales/sales-trend-widget.component';
import { TopProductsWidgetComponent } from '../../widgets/sales/top-products-widget.component';
import { WastageByCategoryWidgetComponent } from '../../widgets/wastage/wastage-by-category-widget.component';
import { WastageSummaryWidgetComponent } from '../../widgets/wastage/wastage-summary-widget.component';
import { WastageTrendWidgetComponent } from '../../widgets/wastage/wastage-trend-widget.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { FilterService } from '../../services/filter.service';
import { DatePreset } from '../../models/filter.model';
import { TopicId } from '../../models/filter-state.model';

@Component({
  selector: 'app-detaileddashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // New filter components
    FilterPanelComponent,
    DrillBreadcrumbComponent,
    ActiveFilterBarComponent,
    // Existing
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
  templateUrl: './detaileddashboard2.html',
  styleUrl: './detaileddashboard2.css',
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

  // Topic definitions — now drives BOTH widget filtering AND filter panel
  topics: {
    key: WidgetTopic;
    topicId: TopicId;
    label: string;
    icon: string;
    color: string;
  }[] = [
    {
      key: 'sales',
      topicId: 'sales',
      label: 'Sales',
      icon: 'trending_up',
      color: '#6366f1',
    },
    {
      key: 'customer',
      topicId: 'customer',
      label: 'Customer',
      icon: 'people',
      color: '#3b82f6',
    },
    {
      key: 'inventory',
      topicId: 'inventory',
      label: 'Inventory',
      icon: 'inventory_2',
      color: '#0ea5e9',
    },
    {
      key: 'promotions',
      topicId: 'sales',
      label: 'Promotions',
      icon: 'local_offer',
      color: '#10b981',
    },
    {
      key: 'profitability',
      topicId: 'profitability',
      label: 'Profitability',
      icon: 'account_balance',
      color: '#8b5cf6',
    },
    {
      key: 'wastage',
      topicId: 'wastage',
      label: 'Wastage',
      icon: 'delete_sweep',
      color: '#f59e0b',
    },
  ];

  // Active topic for filter panel
  get activeTopic(): TopicId {
    return this.filterState.snapshot.topic;
  }

  // AI chat
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
    public filterState: FilterStateService, // ← inject FilterStateService
  ) {}

  ngOnInit() {
    this.loadAnalytics(this.selectedPeriod);

    this.widgetService.widgets$
      .pipe(takeUntil(this.destroy$))
      .subscribe((widgets) => {
        this.allWidgets = widgets;
        this.widgets = widgets
          .filter((w) => w.visible)
          .sort((a, b) => a.order - b.order);
      });

    // Sync date range filter → filter state period filter
    this.filterService.dateRangeChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((preset) => {
        const period = this.convertPresetToPeriod(preset);
        if (period && period !== this.selectedPeriod) {
          this.selectedPeriod = period;
          this.loadAnalytics(period);
        }

        // Also update FilterStateService so widgets can react
        const periodLabel = this.presetToPeriodLabel(preset);
        if (periodLabel) {
          this.filterState.setFilter('period', [periodLabel]);
        }
      });
  }

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

  private presetToPeriodLabel(preset: DatePreset): string | null {
    switch (preset) {
      case 'today':
        return 'Today';
      case 'last7days':
        return 'This Week';
      case 'thisMonth':
      case 'last30days':
        return 'This Month';
      case 'thisYear':
        return 'This Year';
      default:
        return null;
    }
  }

  loadAnalytics(period: TimePeriod) {
    this.loading = true;
    this.analyticsService
      .getCompleteAnalytics(period)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.analytics = { ...data };
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Topic switching ─────────────────────────────────────────────────────

  /**
   * Switching a topic now:
   *  1. Updates the filter panel (via FilterStateService)
   *  2. Keeps the widget grid visible for that topic
   *  3. The active filter context flows to all widgets automatically
   */
  setActiveTopic(topicId: TopicId) {
    this.filterState.setTopic(topicId);

    // Also update widget topic filter so the grid shows relevant widgets
    const widgetTopic = this.topics.find((t) => t.topicId === topicId)?.key;
    if (widgetTopic) this.activeTopicFilter = widgetTopic;
  }

  changePeriod(period: TimePeriod) {
    this.selectedPeriod = period;
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
    this.filterService.updateDateRange(preset);
    this.loadAnalytics(period);
  }

  // ── Existing dashboard methods (unchanged) ──────────────────────────────

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
            content: "Sorry, couldn't process that.",
            time: new Date(),
          });
          this.chatLoading = false;
        },
      });
    });
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
