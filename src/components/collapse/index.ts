import { App } from 'vue';
import Collapse from './Collapse';
import CollapseItem from './CollapseItem';

export default function (app: App) {
  app.component('LeeCollapse', Collapse);
  app.component('LeeCollapseItem', CollapseItem);
}
