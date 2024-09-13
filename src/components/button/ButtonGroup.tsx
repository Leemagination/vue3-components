import { defineComponent, h, renderSlot } from 'vue';
import style from './buttonGroup.scss';

const ButtonGroup = defineComponent({
  __STYLE__: style,
  name: 'ButtonGroup',
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    return <div class={['lee-button-group']}>{slot}</div>;
  }
});

export default ButtonGroup;
