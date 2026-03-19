import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-active-promotions-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Active Promotions" icon="local_offer">
      <div class="promo-grid">
        <div class="promo-card" *ngFor="let p of promotions">
          <div class="promo-header">
            <span class="promo-type">{{ p.type }}</span>
            <span class="promo-status active">LIVE</span>
          </div>
          <div class="promo-name">{{ p.name }}</div>
          <div class="promo-stats">
            <div class="pstat">
              <span class="pstat-val">{{ p.redemptions | number }}</span>
              <span class="pstat-label">Redemptions</span>
            </div>
            <div class="pstat">
              <span class="pstat-val"
                >Rs. {{ p.revenue / 1000 | number: '1.0-0' }}K</span
              >
              <span class="pstat-label">Revenue</span>
            </div>
            <div class="pstat" *ngIf="p.discount > 0">
              <span class="pstat-val">{{ p.discount }}%</span>
              <span class="pstat-label">Discount</span>
            </div>
          </div>
          <div class="promo-end">Ends {{ p.endDate }}</div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .promo-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .promo-card {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }
      .promo-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .promo-type {
        font-size: 10px;
        color: #8892a4;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      .promo-status.active {
        font-size: 9px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 20px;
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        letter-spacing: 0.5px;
      }
      .promo-name {
        font-size: 13px;
        font-weight: 700;
        color: #7c879b;
        margin-bottom: 10px;
        line-height: 1.3;
      }
      .promo-stats {
        display: flex;
        gap: 10px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      .pstat {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .pstat-val {
        font-size: 14px;
        font-weight: 700;
        color: #6366f1;
        font-family: 'JetBrains Mono', monospace;
      }
      .pstat-label {
        font-size: 10px;
        color: #8892a4;
      }
      .promo-end {
        font-size: 11px;
        color: #4f5b6e;
      }
    `,
  ],
})
export class ActivePromotionsWidgetComponent implements OnInit {
  promotions: any[] = [];
  constructor(private analytics: AnalyticsService) {}
  ngOnInit() {
    this.analytics
      .getPromotionData()
      .subscribe((d) => (this.promotions = d.active));
  }
}
