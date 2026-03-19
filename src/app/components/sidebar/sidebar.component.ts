import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

//models
export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    FontAwesomeModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  isExpanded = true;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fa-tachometer-alt', route: '/dashboard' },
    { label: 'Master Data', icon: 'fa-database', route: '/master-data' },
    { label: 'Inventory', icon: 'fa-boxes', route: '/inventory', badge: 5 },
    { label: 'Sales', icon: 'fa-cash-register', route: '/sales' },
    { label: 'Customers', icon: 'fa-users', route: '/customers' },
    { label: 'Reports', icon: 'fa-chart-bar', route: '/reports' },
    { label: 'Branches and Devices', icon: 'fa-store', route: '/branches' },
    { label: 'Users and Security', icon: 'fa-user-shield', route: '/users' },
    { label: 'Insights', icon: 'fa-lightbulb', route: '/insights' },
    { label: 'Analytics', icon: 'fa-chart-line', route: '/analytics' },
    { label: 'Settings', icon: 'fa-cog', route: '/settings' },
  ];

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
  }
}
