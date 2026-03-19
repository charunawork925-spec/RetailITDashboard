import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { WidgetWrapperComponent } from '../../shared/widget-wrapper.component';

@Component({
  selector: 'app-customer-satisfaction-widget',
  standalone: true,
  imports: [CommonModule, WidgetWrapperComponent],
  template: `
    <app-widget-wrapper title="Satisfaction" icon="sentiment_satisfied">
      <div class="sat-grid" *ngIf="data">
        <div class="sat-metric nps">
          <div class="sat-value">{{ data.nps }}</div>
          <div class="sat-label">NPS Score</div>
        </div>
        <div class="sat-metric">
          <div class="sat-value">
            {{ data.csat }}<span class="sat-sub">/5</span>
          </div>
          <div class="sat-label">CSAT</div>
        </div>
        <div class="sat-metric">
          <div class="sat-value positive">{{ data.positive }}%</div>
          <div class="sat-label">Positive</div>
        </div>
        <div class="sat-metric">
          <div class="sat-value">{{ data.reviews | number }}</div>
          <div class="sat-label">Reviews</div>
        </div>
      </div>
    </app-widget-wrapper>
  `,
  styles: [
    `
      .sat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .sat-metric {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        text-align: center;
      }
      .nps .sat-value {
        color: #6366f1;
      }
      .sat-value {
        font-size: 22px;
        font-weight: 800;
        color: #7c879b;
        font-family: 'JetBrains Mono', monospace;
      }
      .sat-value.positive {
        color: #10b981;
      }
      .sat-sub {
        font-size: 14px;
        color: #8892a4;
      }
      .sat-label {
        font-size: 11px;
        color: #8892a4;
        margin-top: 4px;
      }
    `,
  ],
})
export class CustomerSatisfactionWidgetComponent implements OnInit {
  data: any;
  constructor(private analytics: AnalyticsService) {}
  ngOnInit() {
    this.analytics
      .getCustomerData()
      .subscribe((d) => (this.data = d.satisfaction));
  }
}
