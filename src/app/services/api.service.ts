import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Field {
  key: string;
  label: string;
  type: 'dim' | 'msr' | 'date' | 'bool';
  column: string;
}
export interface Dataset {
  id: string;
  label: string;
  icon: string;
  table: string;
  fields: Field[];
}
export interface QueryRequest {
  dataset: string;
  dimensions: string[];
  measures: string[];
  filters?: any[];
  limit?: number;
  order_by?: string;
  order_dir?: string;
}
export interface QueryResponse {
  dataset: string;
  columns: string[];
  rows: any[];
  count: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:8000/api';
  constructor(private http: HttpClient) {}
  getDatasets(): Observable<Dataset[]> {
    return this.http.get<Dataset[]>(`${this.base}/datasets`);
  }
  getKpis(): Observable<any> {
    return this.http.get<any>(`${this.base}/kpis`);
  }
  getDashboardCharts(): Observable<any> {
    return this.http.get<any>(`${this.base}/dashboard/charts`);
  }
  getTop10(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/top10`);
  }
  getPresets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/presets`);
  }
  query(req: QueryRequest): Observable<QueryResponse> {
    console.log('Query Request:', req);
    return this.http.post<QueryResponse>(`${this.base}/query`, req);
  }
}
