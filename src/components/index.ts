import { App } from 'vue';
import loadButton from './button';
import Divider from './divider/Divider';
import Switch from './switch/Switch';
import Tag from './tag/Tag';
import Slider from './slider/Slider';
import Progress from './progress/Progress';
import Alert from './alert/Alert';
import loadBreadcrumb from './breadcrumb';
import loadTimeline from './timeline';
import loadSteps from './steps';
import loadInput from './input';
import loadCollapse from './collapse';
import loadRadio from './radio';
import loadCheckbox from './checkbox';
import BackTop from './backTop/BackTop';
import Card from './card/Card';
import Rate from './rate/Rate';
import loadList from './list/index';
import loadInputNumber from './inputNumber/index';
import Popover from './popover/Popover';
import Tooltip from './tooltip/Tooltip';
export default {
  install: (app: App) => {
    loadButton(app);
    loadBreadcrumb(app);
    loadTimeline(app);
    loadSteps(app);
    loadInput(app);
    loadCollapse(app);
    loadRadio(app);
    loadCheckbox(app);
    loadList(app);
    loadInputNumber(app);
    app.component('LeeDivider', Divider);
    app.component('LeeSwitch', Switch);
    app.component('LeeTag', Tag);
    app.component('LeeSlider', Slider);
    app.component('LeeProgress', Progress);
    app.component('LeeAlert', Alert);
    app.component('LeeBackTop', BackTop);
    app.component('LeeCard', Card);
    app.component('LeeRate', Rate);
    app.component('LeePopover', Popover);
    app.component('LeeTooltip', Tooltip);
  }
};
