// components/configuration/filter-panel/filter-panel.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="filter-panel">
      <h3>Filters</h3>
      <div class="filter-row">
        <mat-form-field>
          <mat-label>Date Range</mat-label>
          <input matInput [matDatepicker]="picker" placeholder="Choose date">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [`
    .filter-panel {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .filter-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
  `]
})
export class FilterPanelComponent {
  @Input() filters: any;
  @Output() filtersChanged = new EventEmitter<any>();
}