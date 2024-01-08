import { computed, defineComponent, h, PropType, ref, renderSlot, watch } from 'vue';
import './tag.scss';

import { MouseFunc } from '../../config/interface';
import { CustomColor, tagType, TagType } from './interface';
import { getPropsValue } from '../../util';
const tagProps = {
  closable: Boolean,
  selectable: Boolean,
  checked: Boolean,
  customColor: {
    type: Object as PropType<CustomColor>,
    default: undefined
  },
  type: {
    type: String as PropType<TagType>,
    default: 'default'
  },
  onClick: Function as PropType<MouseFunc>
};

const Tag = defineComponent({
  props: tagProps,
  emits: ['update:checked', 'change', 'close'],
  setup(props, context) {
    const checkedValue = ref(props.checked);
    watch(
      () => props.checked,
      () => {
        checkedValue.value = props.checked;
      }
    );
    const selectMode = computed(() => {
      return props.selectable;
    });
    const closable = computed(() => {
      return props.closable;
    });
    const type = computed(() => {
      return getPropsValue(props.type, tagType);
    });
    const customColor = computed(() => {
      return props.customColor;
    });
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (selectMode.value) {
        checkedValue.value = !checkedValue.value;
        context.emit('update:checked', checkedValue.value);
        context.emit('change', checkedValue.value);
      }
      const { onClick } = props;
      onClick && onClick(e);
    }
    function handleCloseClick(e: MouseEvent) {
      e.preventDefault();
      context.emit('close', e);
    }
    return { handleClick, selectMode, checkedValue, closable, handleCloseClick, type, customColor };
  },
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    const renderCloseIcon = () => {
      if (!this.closable) return null;
      return (
        <div class={'lee-tag-close-icon'} onClick={this.handleCloseClick}>
          X
        </div>
      );
    };
    return (
      <div
        onClick={this.handleClick}
        style={this.customColor}
        class={[
          'lee-tag',
          !this.selectMode && this.type !== 'default' ? `lee-${this.type}-tag` : null,
          this.selectMode ? `lee-${this.checkedValue ? 'checked' : 'uncheck'}-tag` : null
        ]}
      >
        {slot}
        {renderCloseIcon()}
      </div>
    );
  }
});

export default Tag;
