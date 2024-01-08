import { defineComponent, h, renderSlot } from 'vue';
import './buttonGroup.scss';

const ButtonGroup = defineComponent({
  name: 'ButtonGroup',
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    return <div class={['lee-button-group']}>{slot}</div>;
  }
});

export default ButtonGroup;
