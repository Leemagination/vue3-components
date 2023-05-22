import { App } from 'vue';
import Timeline from './Timeline';
import TimelineItem from './TimelineItem';
export default function (app: App) {
  app.component('LeeTimeline', Timeline);
  app.component('LeeTimelineItem', TimelineItem);
}
