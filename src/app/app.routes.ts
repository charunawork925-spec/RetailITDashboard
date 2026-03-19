import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InsightsComponent } from './pages/insights/insights.component';
import { AnalyticsDashboard } from './pages/analytics-dashboard/analytics-dashboard';
// import { Detaileddashboard } from './pages/analytical-dashboard/detaileddashboard2';
import { Detaileddashboard } from './pages/detaileddashboard/detaileddashboard';

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
  { path: '**', redirectTo: '/dashboard' },
];
