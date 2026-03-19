import { Pipe, PipeTransform } from '@angular/core';
import { WidgetConfig, WidgetTopic } from '../models/analytics';

@Pipe({ name: 'topicFilter', standalone: true })
export class TopicFilterPipe implements PipeTransform {
  transform(widgets: WidgetConfig[], topic: WidgetTopic): WidgetConfig[] {
    return widgets.filter(w => w.topic === topic);
  }
}
