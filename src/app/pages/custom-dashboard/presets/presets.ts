import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-presets',
  imports: [CommonModule],
  templateUrl: './presets.html',
  styleUrl: './presets.css',
})
export class Presets implements OnInit {
  presets: any[] = [];
  loading = true;

  colorMap: any = {
    blue: {
      bg: 'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.2)',
      accent: '#3b82f6',
    },
    green: {
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)',
      accent: '#10b981',
    },
    amber: {
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.2)',
      accent: '#f59e0b',
    },
    purple: {
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.2)',
      accent: '#8b5cf6',
    },
    red: {
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.2)',
      accent: '#ef4444',
    },
    cyan: {
      bg: 'rgba(6,182,212,0.08)',
      border: 'rgba(6,182,212,0.2)',
      accent: '#06b6d4',
    },
    pink: {
      bg: 'rgba(236,72,153,0.08)',
      border: 'rgba(236,72,153,0.2)',
      accent: '#ec4899',
    },
  };

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.api.getPresets().subscribe({
      next: (d) => {
        this.presets = d;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getThumb(p: any): string {
    return this.colorMap[p.color]?.bg || 'rgba(59,130,246,0.08)';
  }

  getAccent(p: any): string {
    return this.colorMap[p.color]?.accent || '#3b82f6';
  }

  openInBuilder(preset: any) {
    // Store preset in sessionStorage, navigate to builder
    sessionStorage.setItem('loadPreset', JSON.stringify(preset));
    this.router.navigate(['/builder']);
  }
}
