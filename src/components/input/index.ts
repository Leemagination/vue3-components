import { App } from 'vue';
import Input from './Input';
import Textarea from './Textarea';
export default function (app: App) {
  app.component('LeeInput', Input);
  app.component('LeeTextarea', Textarea);
}
