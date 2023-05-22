import { App } from 'vue';
import loadButton from './button';
import Divider from './divider/Divider';
import Switch from './switch/Switch';
import Tag from './tag/Tag';
import Slider from './slider/Slider';
import Progress from './progress/Progress';
import Alert from './alert/Alert';
import Input from './input/Input';
import loadBreadcrumb from './breadcrumb';
import loadTimeline from './timeline';
import loadSteps from './steps';
import loadInput from './input';
export default {
  install: (app: App) => {
    loadButton(app);
    loadBreadcrumb(app);
    loadTimeline(app);
    loadSteps(app);
    loadInput(app);
    app.component('LeeDivider', Divider);
    app.component('LeeSwitch', Switch);
    app.component('LeeTag', Tag);
    app.component('LeeSlider', Slider);
    app.component('LeeProgress', Progress);
    app.component('LeeAlert', Alert);
  }
};
