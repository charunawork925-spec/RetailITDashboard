import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, map, startWith } from 'rxjs';
type EventType = 'sale' | 'inventory' | 'customer' | 'alert';
type Severity = 'info' | 'warning' | 'critical';

const eventTypes: EventType[] = ['sale', 'inventory', 'customer', 'alert'];
const severities: Severity[] = ['info', 'warning', 'critical'];

@Injectable({
  providedIn: 'root',
})
export class AnalyticsDashboardService {
  private realTimeEvents = new BehaviorSubject<any[]>([]);
  
  // Complex mock data generation
  generateTimeSeriesData(days: number = 30): any[] {
    const data = [];
    const baseDate = new Date();
    let value = 1000;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - (days - i));
      
      // Add randomness and trends
      value += (Math.random() - 0.5) * 200;
      value = Math.max(500, Math.min(5000, value));
      
      // Weekly seasonality
      if (date.getDay() === 0 || date.getDay() === 6) {
        value *= 0.7; // Weekend dip
      }
      
      data.push({
        timestamp: date,
        value: Math.round(value),
        category: i % 5 === 0 ? 'Special' : 'Regular'
      });
    }
    return data;
  }
  
  generatePredictiveData(): any {
    const forecast = [];
    const confidence = [];
    const baseValue = 2500;
    
    for (let i = 1; i <= 30; i++) {
      const trend = baseValue + (i * 20);
      const seasonality = 200 * Math.sin(i * 0.5);
      const forecastValue = trend + seasonality + (Math.random() * 100);
      
      forecast.push(Math.round(forecastValue));
      confidence.push([
        Math.round(forecastValue * 0.9),
        Math.round(forecastValue * 1.1)
      ]);
    }
    
    return {
      forecast,
      confidenceInterval: confidence,
      seasonality: 0.85,
      trend: 1.2,
      accuracy: 92.5
    };
  }
  
  generateHeatMapData(): any[] {
    const hours = Array.from({length: 24}, (_, i) => i);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map(day => {
      return hours.map(hour => {
        let value = 50;
        // Business hours peak
        if (hour >= 9 && hour <= 17) value += 150;
        // Lunch dip
        if (hour >= 12 && hour <= 13) value -= 50;
        // Weekend pattern
        if (['Sat', 'Sun'].includes(day)) {
          value = hour >= 10 && hour <= 20 ? 100 : 30;
        }
        // Add randomness
        value += Math.random() * 30;
        
        return {
          day,
          hour,
          value: Math.round(value),
          label: `${day} ${hour}:00`
        };
      });
    }).flat();
  }
  
  // Simulate real-time data stream
  // getRealTimeStream(): Observable<any> {
  //   return interval(5000).pipe(
  //     map(() => {
  //       const events = [];
  //       const eventTypes = ['sale', 'inventory', 'customer', 'alert'];
  //       const severities = ['info', 'warning', 'critical'];
        
  //       // Generate 0-2 events per interval
  //       for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
  //         const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  //         events.push({
  //           id: `event_${Date.now()}_${i}`,
  //           type,
  //           timestamp: new Date(),
  //           message: this.generateEventMessage(type),
  //           severity: severities[Math.floor(Math.random() * severities.length)],
  //           data: this.generateEventData(type)
  //         });
  //       }
        
  //       const currentEvents = this.realTimeEvents.value;
  //       const newEvents = [...events, ...currentEvents].slice(0, 50);
  //       this.realTimeEvents.next(newEvents);
        
  //       return events;
  //     }),
  //     startWith([])
  //   );
  // }

  getRealTimeStream(): Observable<any[]> {
  return interval(5000).pipe(
    map(() => {
      const events: any[] = [];

      const eventTypes: EventType[] = ['sale', 'inventory', 'customer', 'alert'];
      const severities: Severity[] = ['info', 'warning', 'critical'];

      // Generate 0–2 events per interval
      for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        events.push({
          id: `event_${Date.now()}_${i}`,
          type,
          timestamp: new Date(),
          message: this.generateEventMessage(type), 
          severity: severities[Math.floor(Math.random() * severities.length)],
          data: this.generateEventData(type)
        });
      }

      const currentEvents = this.realTimeEvents.value;
      const newEvents = [...events, ...currentEvents].slice(0, 50);
      this.realTimeEvents.next(newEvents);

      return events;
    }),
    startWith([])
  );
}


private generateEventMessage(type: EventType): string {
  const messages: Record<EventType, string[]> = {
    sale: ['New transaction processed', 'High-value sale detected', 'Online order received'],
    inventory: ['Low stock alert', 'Restock completed', 'Inventory discrepancy found'],
    customer: ['New customer registered', 'VIP customer activity', 'Customer complaint received'],
    alert: ['System anomaly detected', 'Performance threshold exceeded', 'Security alert']
  };

  const list = messages[type];
  return list[Math.floor(Math.random() * list.length)];
}
  
  
  // private generateEventMessage(type: string): string {
  //   const messages = {
  //     sale: ['New transaction processed', 'High-value sale detected', 'Online order received'],
  //     inventory: ['Low stock alert', 'Restock completed', 'Inventory discrepancy found'],
  //     customer: ['New customer registered', 'VIP customer activity', 'Customer complaint received'],
  //     alert: ['System anomaly detected', 'Performance threshold exceeded', 'Security alert']
  //   };
    
  //   return messages[type][Math.floor(Math.random() * messages[type].length)];
  // }
  
  private generateEventData(type: string): any {
    switch(type) {
      case 'sale':
        return {
          amount: Math.round(Math.random() * 1000 + 100),
          product: `Product-${Math.floor(Math.random() * 100)}`,
          region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)]
        };
      case 'inventory':
        return {
          productId: `P${1000 + Math.floor(Math.random() * 9000)}`,
          currentStock: Math.floor(Math.random() * 100),
          threshold: 20
        };
      default:
        return {};
    }
  }
}
