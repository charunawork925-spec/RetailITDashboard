import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-promo-summary-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Promo Summary" icon="campaign">
      <div class="summary-grid" *ngIf="summary">
        <div class="sum-item">
          <div class="sum-val">{{ summary.activePromos }}</div>
          <div class="sum-label">Active</div>
        </div>
        <div class="sum-item">
          <div class="sum-val">{{ summary.totalRedemptions | number }}</div>
          <div class="sum-label">Redemptions</div>
        </div>
        <div class="sum-item highlight">
          <div class="sum-val">
            Rs. {{ summary.revenueImpact / 1000 | number: '1.0-0' }}K
          </div>
          <div class="sum-label">Revenue Impact</div>
        </div>
        <div class="sum-item">
          <div class="sum-val">{{ summary.avgDiscount }}%</div>
          <div class="sum-label">Avg Discount</div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .summary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .sum-item {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        padding: 12px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .sum-item.highlight {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.2);
      }
      .sum-val {
        font-size: 18px;
        font-weight: 800;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
      }
      .highlight .sum-val {
        color: #6366f1;
      }
      .sum-label {
        font-size: 11px;
        color: #8892a4;
        margin-top: 4px;
      }
    `,
  ],
})
export class PromoSummaryWidgetComponent implements OnInit {
  summary: any;
  constructor(private analytics: AnalyticsService) {}
  ngOnInit() {
    this.analytics
      .getPromotionData()
      .subscribe((d) => (this.summary = d.summary));
  }
}
