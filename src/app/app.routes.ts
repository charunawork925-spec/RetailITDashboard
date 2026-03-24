import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InsightsComponent } from './pages/insights/insights.component';
import { AnalyticsDashboard } from './pages/analytics-dashboard/analytics-dashboard';
// import { Detaileddashboard } from './pages/analytical-dashboard/detaileddashboard2';
import { Detaileddashboard } from './pages/detaileddashboard/detaileddashboard';
import { Dashboard } from './pages/custom-dashboard/dashboard/dashboard';
import { Builder } from './pages/custom-dashboard/builder/builder';
import { Presets } from './pages/custom-dashboard/presets/presets';
import { CustomMain } from './pages/custom-main/custom-main';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'insights', component: InsightsComponent },
  {
    path: 'analytics',
    component: Detaileddashboard,
  },
  {
    path: 'analytics/:dashboardId',
    component: AnalyticsDashboard,
  },
  {
    path: 'custom-dashboard',
    component: Dashboard,
  },
  {
    path: 'builder',
    component: Builder,
  },
  {
    path: 'presets',
    component: Presets,
  },
  {
    path: 'custommain',
    component: CustomMain,
  },
  { path: '**', redirectTo: '/dashboard' },
];
