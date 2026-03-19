// components/configuration/widget-config/widget-config.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-widget-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Configure Widget</h2>
    
    <mat-dialog-content>
      <form [formGroup]="configForm" class="config-form">
        
        <!-- Basic Settings -->
        <div class="form-section">
          <h3>Basic Settings</h3>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Widget Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter widget title">
            <mat-error *ngIf="configForm.get('title')?.hasError('required')">
              Title is required
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Widget Type</mat-label>
            <mat-select formControlName="type" [disabled]="true">
              <mat-option *ngFor="let type of widgetTypes" [value]="type.value">
                <mat-icon>{{type.icon}}</mat-icon> {{type.label}}
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Data Source</mat-label>
            <mat-select formControlName="dataSource">
              <mat-option *ngFor="let source of dataSources" [value]="source.value">
                {{source.label}}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        
        <!-- Chart Specific Settings -->
        <mat-expansion-panel *ngIf="configForm.get('type')?.value === 'chart'">
          <mat-expansion-panel-header>
            <mat-panel-title>Chart Settings</mat-panel-title>
          </mat-expansion-panel-header>
          
          <div class="chart-settings">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Chart Type</mat-label>
              <mat-select formControlName="chartType">
                <mat-option value="line">Line Chart</mat-option>
                <mat-option value="bar">Bar Chart</mat-option>
                <mat-option value="pie">Pie Chart</mat-option>
                <mat-option value="doughnut">Doughnut Chart</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Color Scheme</mat-label>
              <mat-select formControlName="colorScheme">
                <mat-option *ngFor="let scheme of colorSchemes" [value]="scheme.value">
                  <div class="color-option">
                    <div class="color-preview" [style.background-color]="scheme.color"></div>
                    {{scheme.label}}
                  </div>
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-slide-toggle formControlName="showLegend">
              Show Legend
            </mat-slide-toggle>
            
            <mat-slide-toggle formControlName="showGrid">
              Show Grid Lines
            </mat-slide-toggle>
          </div>
        </mat-expansion-panel>
        
        <!-- Table Specific Settings -->
        <mat-expansion-panel *ngIf="configForm.get('type')?.value === 'table'">
          <mat-expansion-panel-header>
            <mat-panel-title>Table Settings</mat-panel-title>
          </mat-expansion-panel-header>
          
          <div class="table-settings">
            <mat-slide-toggle formControlName="showPagination">
              Enable Pagination
            </mat-slide-toggle>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rows Per Page</mat-label>
              <input matInput type="number" formControlName="pageSize" min="5" max="100">
            </mat-form-field>
            
            <mat-slide-toggle formControlName="stripedRows">
              Striped Rows
            </mat-slide-toggle>
            
            <mat-slide-toggle formControlName="showExport">
              Show Export Buttons
            </mat-slide-toggle>
          </div>
        </mat-expansion-panel>
        
        <!-- Display Settings -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>Display Settings</mat-panel-title>
          </mat-expansion-panel-header>
          
          <div class="display-settings">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Background Color</mat-label>
              <input matInput type="color" formControlName="backgroundColor">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Text Color</mat-label>
              <input matInput type="color" formControlName="textColor">
            </mat-form-field>
            
            <mat-slide-toggle formControlName="showBorder">
              Show Border
            </mat-slide-toggle>
            
            <mat-slide-toggle formControlName="showShadow">
              Show Shadow
            </mat-slide-toggle>
          </div>
        </mat-expansion-panel>
        
        <!-- Data Settings -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>Data Settings</mat-panel-title>
          </mat-expansion-panel-header>
          
          <div class="data-settings">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Refresh Interval (seconds)</mat-label>
              <input matInput type="number" formControlName="refreshInterval" min="0" step="5">
              <mat-hint>0 = manual refresh only</mat-hint>
            </mat-form-field>
            
            <mat-slide-toggle formControlName="autoRefresh">
              Auto Refresh
            </mat-slide-toggle>
            
            <mat-slide-toggle formControlName="showLastUpdated">
              Show Last Updated Time
            </mat-slide-toggle>
          </div>
        </mat-expansion-panel>
        
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button (click)="onReset()">Reset</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!configForm.valid">
        Save Changes
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .config-form {
      min-width: 500px;
      max-width: 600px;
    }
    .form-section {
      margin-bottom: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .half-width {
      width: 48%;
      margin-right: 4%;
      margin-bottom: 16px;
    }
    .half-width:last-child {
      margin-right: 0;
    }
    .color-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .color-preview {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
    h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 1.1rem;
    }
    .chart-settings,
    .table-settings,
    .display-settings,
    .data-settings {
      padding: 16px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    mat-expansion-panel {
      margin-bottom: 8px;
    }
    mat-expansion-panel-header {
      background-color: #f8f9fa !important;
    }
  `]
})
export class WidgetConfigComponent implements OnInit {
  configForm!: FormGroup;
  
  widgetTypes = [
    { value: 'metric', label: 'Metric Card', icon: 'speed' },
    { value: 'chart', label: 'Chart', icon: 'show_chart' },
    { value: 'table', label: 'Table', icon: 'table_chart' },
    { value: 'list', label: 'List', icon: 'list' }
  ];
  
  dataSources = [
    { value: 'sales', label: 'Sales Data' },
    { value: 'inventory', label: 'Inventory Data' },
    { value: 'customers', label: 'Customer Data' },
    { value: 'promotion', label: 'Promotion Data' },
    { value: 'profitability', label: 'Profitability Data' },
    { value: 'wastage', label: 'Wastage Data' }
  ];
  
  colorSchemes = [
    { value: 'blue', label: 'Blue Theme', color: '#3B82F6' },
    { value: 'green', label: 'Green Theme', color: '#10B981' },
    { value: 'purple', label: 'Purple Theme', color: '#8B5CF6' },
    { value: 'orange', label: 'Orange Theme', color: '#F59E0B' },
    { value: 'red', label: 'Red Theme', color: '#EF4444' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WidgetConfigComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { widget: any }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadWidgetData();
  }

  private initializeForm(): void {
    this.configForm = this.fb.group({
      // Basic settings
      title: ['', [Validators.required, Validators.maxLength(100)]],
      type: ['', Validators.required],
      dataSource: ['sales', Validators.required],
      
      // Chart settings
      chartType: ['line'],
      colorScheme: ['blue'],
      showLegend: [true],
      showGrid: [true],
      
      // Table settings
      showPagination: [false],
      pageSize: [10],
      stripedRows: [true],
      showExport: [false],
      
      // Display settings
      backgroundColor: ['#ffffff'],
      textColor: ['#333333'],
      showBorder: [true],
      showShadow: [true],
      
      // Data settings
      refreshInterval: [0],
      autoRefresh: [false],
      showLastUpdated: [true]
    });
  }

  private loadWidgetData(): void {
    if (this.data?.widget) {
      const widget = this.data.widget;
      
      // Map widget data to form
      this.configForm.patchValue({
        title: widget.title || '',
        type: widget.type || 'metric',
        dataSource: widget.dataSource || 'sales',
        chartType: widget.config?.chartType || 'line',
        colorScheme: widget.config?.colorScheme || 'blue',
        showLegend: widget.config?.showLegend !== false,
        showGrid: widget.config?.showGrid !== false,
        showPagination: widget.config?.showPagination || false,
        pageSize: widget.config?.pageSize || 10,
        stripedRows: widget.config?.stripedRows !== false,
        showExport: widget.config?.showExport || false,
        backgroundColor: widget.config?.backgroundColor || '#ffffff',
        textColor: widget.config?.textColor || '#333333',
        showBorder: widget.config?.showBorder !== false,
        showShadow: widget.config?.showShadow !== false,
        refreshInterval: widget.config?.refreshInterval || 0,
        autoRefresh: widget.config?.autoRefresh || false,
        showLastUpdated: widget.config?.showLastUpdated !== false
      });
    }
  }

  onSave(): void {
    if (this.configForm.valid) {
      const formValue = this.configForm.value;
      
      // Prepare the updated widget configuration
      const updatedWidget = {
        ...this.data.widget,
        title: formValue.title,
        dataSource: formValue.dataSource,
        config: {
          ...this.data.widget?.config,
          chartType: formValue.chartType,
          colorScheme: formValue.colorScheme,
          showLegend: formValue.showLegend,
          showGrid: formValue.showGrid,
          showPagination: formValue.showPagination,
          pageSize: formValue.pageSize,
          stripedRows: formValue.stripedRows,
          showExport: formValue.showExport,
          backgroundColor: formValue.backgroundColor,
          textColor: formValue.textColor,
          showBorder: formValue.showBorder,
          showShadow: formValue.showShadow,
          refreshInterval: formValue.refreshInterval,
          autoRefresh: formValue.autoRefresh,
          showLastUpdated: formValue.showLastUpdated
        }
      };
      
      this.dialogRef.close(updatedWidget);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onReset(): void {
    if (confirm('Reset all settings to defaults?')) {
      this.configForm.reset({
        title: '',
        type: this.data?.widget?.type || 'metric',
        dataSource: 'sales',
        chartType: 'line',
        colorScheme: 'blue',
        showLegend: true,
        showGrid: true,
        showPagination: false,
        pageSize: 10,
        stripedRows: true,
        showExport: false,
        backgroundColor: '#ffffff',
        textColor: '#333333',
        showBorder: true,
        showShadow: true,
        refreshInterval: 0,
        autoRefresh: false,
        showLastUpdated: true
      });
    }
  }
}