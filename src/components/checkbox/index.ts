import { App } from 'vue';

import Checkbox from './Checkbox';
import CheckboxGroup from './CheckboxGroup';

export default function (app: App) {
  app.component('LeeCheckbox', Checkbox);
  app.component('LeeCheckboxGroup', CheckboxGroup);
}
