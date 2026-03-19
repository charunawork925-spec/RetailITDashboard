// dashboard-config.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-dashboard-config',
  standalone: true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule, // ✅ Angular Material
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule],
  template: `
    <h2 mat-dialog-title>Configure Dashboard</h2>
    <mat-dialog-content>
      <form [formGroup]="configForm">
        <mat-form-field>
          <mat-label>Dashboard Name</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        
        <mat-form-field>
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description"></textarea>
        </mat-form-field>
        
        <mat-form-field>
          <mat-label>Grid Columns</mat-label>
          <mat-select formControlName="gridCols">
            <mat-option [value]="6">6 Columns</mat-option>
            <mat-option [value]="12">12 Columns</mat-option>
            <mat-option [value]="24">24 Columns</mat-option>
          </mat-select>
        </mat-form-field>
        
        <div class="widget-settings" *ngIf="data.widget">
          <h3>Widget Settings</h3>
          <!-- Widget-specific settings -->
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()">Save</button>
    </mat-dialog-actions>
  `
})
export class DashboardConfigComponent {
  configForm: any;

  constructor(
    public dialogRef: MatDialogRef<DashboardConfigComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  save(): void {
    this.dialogRef.close(this.configForm.value);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}