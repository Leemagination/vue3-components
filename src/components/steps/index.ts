import { App } from 'vue';
import Steps from './Steps';
import Step from './Step';
export default function (app: App) {
  app.component('LeeSteps', Steps);
  app.component('LeeStep', Step);
}
