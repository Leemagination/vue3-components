import { computed, defineComponent, h, PropType, ref, renderSlot, watch } from 'vue';
import style from './tag.scss';

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

export const closeIcon = (
  <svg viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g fill="currentColor" fill-rule="nonzero">
        <path d="M2.08859116,2.2156945 L2.14644661,2.14644661 C2.32001296,1.97288026 2.58943736,1.95359511 2.7843055,2.08859116 L2.85355339,2.14644661 L6,5.293 L9.14644661,2.14644661 C9.34170876,1.95118446 9.65829124,1.95118446 9.85355339,2.14644661 C10.0488155,2.34170876 10.0488155,2.65829124 9.85355339,2.85355339 L6.707,6 L9.85355339,9.14644661 C10.0271197,9.32001296 10.0464049,9.58943736 9.91140884,9.7843055 L9.85355339,9.85355339 C9.67998704,10.0271197 9.41056264,10.0464049 9.2156945,9.91140884 L9.14644661,9.85355339 L6,6.707 L2.85355339,9.85355339 C2.65829124,10.0488155 2.34170876,10.0488155 2.14644661,9.85355339 C1.95118446,9.65829124 1.95118446,9.34170876 2.14644661,9.14644661 L5.293,6 L2.14644661,2.85355339 C1.97288026,2.67998704 1.95359511,2.41056264 2.08859116,2.2156945 L2.14644661,2.14644661 L2.08859116,2.2156945 Z"></path>
      </g>
    </g>
  </svg>
);

const Tag = defineComponent({
  __STYLE__: style,
  name: 'Tag',
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
          {closeIcon}
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
