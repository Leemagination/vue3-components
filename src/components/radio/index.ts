import { App } from 'vue';

import Radio from './Radio';
import RadioGroup from './RadioGroup';

export default function (app: App) {
  app.component('LeeRadio', Radio);
  app.component('LeeRadioGroup', RadioGroup);
}
