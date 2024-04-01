import { defineComponent, renderSlot, h } from 'vue';
import './list.scss';
const List = defineComponent({
  name: 'List',
  props: {
    bordered: Boolean,
    hoverStatus: Boolean,
    splitLine: {
      type: Boolean,
      default: true
    }
  },
  render() {
    const { $slots, $props } = this;
    const slot = renderSlot($slots, 'default');
    const headerSlot = renderSlot($slots, 'header');
    const footerSlot = renderSlot($slots, 'footer');
    const showHeader = headerSlot.children?.length;
    const showFooter = footerSlot.children?.length;
    return (
      <div
        class={[
          'lee-list-container',
          $props.splitLine ? 'lee-list-container--split' : null,
          $props.bordered ? 'lee-list-container--bordered' : null,
          $props.hoverStatus ? 'lee-list-container--hover' : null
        ]}
      >
        {showHeader ? <div class="lee-list-container__header">{headerSlot}</div> : null}
        <div class="lee-list-wrapper">{slot}</div>
        {showFooter ? <div class="lee-list-container__footer">{footerSlot}</div> : null}
      </div>
    );
  }
});

export default List;
