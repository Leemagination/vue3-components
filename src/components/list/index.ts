import { App } from 'vue';
import List from './List';
import ListItem from './ListItem';
export default function (app: App) {
  app.component('LeeList', List);
  app.component('LeeListItem', ListItem);
}
