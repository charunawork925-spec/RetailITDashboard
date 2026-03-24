import { Component } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';
import { CommonModule } from '@angular/common'; // Add this import

interface NavItem {
  id: string;
  icon: string;
  label: string;
  description: string;
  route: string;
  tag?: string;
  stats?: string;
}

@Component({
  selector: 'app-custom-main',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], // Add CommonModule here
  templateUrl: './custom-main.html',
  styleUrl: './custom-main.css',
})
export class CustomMain {
  activeId = 'dashboard';

  navItems: NavItem[] = [
    {
      id: 'dashboard',
      icon: 'fa-house-chimney',
      label: 'Dashboard',
      description: 'Live metrics, KPIs, and real-time sales at a glance.',
      route: '/dashboard',
      tag: 'Live',
      stats: '12 widgets',
    },
    {
      id: 'builder',
      icon: 'fa-bolt',
      label: 'Report Builder',
      description: 'Drag-and-drop builder to craft fully custom reports.',
      route: '/builder',
      stats: '3 drafts',
    },
    {
      id: 'presets',
      icon: 'fa-layer-group',
      label: 'Presets',
      description: 'Start fast with curated templates for common scenarios.',
      route: '/presets',
      tag: 'New',
      stats: '24 templates',
    },
  ];

  constructor(private router: Router) {}

  select(item: NavItem): void {
    this.activeId = item.id;
  }

  navigate(item: NavItem): void {
    this.activeId = item.id;
    this.router.navigate([item.route]);
  }

  get activeItem(): NavItem {
    return this.navItems.find((i) => i.id === this.activeId)!;
  }
}
