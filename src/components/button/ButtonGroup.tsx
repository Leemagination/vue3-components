import { defineComponent, h, renderSlot } from 'vue';
import './buttonGroup.scss';
import { cssPrefix } from '../../config/globalConfig';
const ButtonGroup = defineComponent({
  name: 'ButtonGroup',
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    return <div class={[`${cssPrefix}-button-group`]}>{slot}</div>;
  }
});

export default ButtonGroup;
