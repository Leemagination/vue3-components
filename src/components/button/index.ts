import { App } from 'vue';
import Button from './Button';
import ButtonGroup from './ButtonGroup';

export default function (app: App) {
  app.component('LeeButton', Button);
  app.component('LeeButtonGroup', ButtonGroup);
}
