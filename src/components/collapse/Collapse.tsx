import {
  defineComponent,
  ExtractPropTypes,
  SetupContext,
  h,
  Fragment,
  renderSlot,
  ref,
  provide,
  shallowRef
} from 'vue';
import './collapse.scss';
import { CollapseItem, CollapseProvideType } from './interface';
const collapseProps = {
  accordion: {
    type: Boolean,
    default: false
  }
};
const setup = (props: ExtractPropTypes<typeof collapseProps>, context: SetupContext) => {
  const collapseItemList = shallowRef<CollapseItem[]>([]);
  function addItemRef(data: CollapseItem) {
    collapseItemList.value.push(data);
  }
  function changeItemStatus(target: string | symbol) {
    collapseItemList.value.forEach((item) => {
      if (item.name === target) {
        item.status.value = !item.status.value;
        context.emit('item-change', { name: item.name, status: item.status.value });
      } else if (props.accordion) {
        if (item.status.value) {
          item.status.value = false;
          context.emit('item-change', { name: item.name, status: item.status.value });
        }
      }
    });
  }
  provide<CollapseProvideType>('collapseProvideKey', {
    changeItemStatus,
    addItemRef
  });
  return {};
};

const Collapse = defineComponent({
  name: 'Collapse',
  props: collapseProps,
  emit: ['item-change'],
  setup,
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    return <div class="lee-collapse">{slot}</div>;
  }
});

export default Collapse;
