import { defineComponent, renderSlot, h } from 'vue';

const ListItem = defineComponent({
  name: 'ListItem',
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    const prefixSlot = renderSlot($slots, 'prefix');
    const suffixSlot = renderSlot($slots, 'suffix');
    const showPrefix = prefixSlot.children?.length;
    const showSuffix = suffixSlot.children?.length;
    return (
      <div class="lee-list-item">
        {showPrefix ? <div class="lee-list-item__prefix">{prefixSlot}</div> : null}
        <div class="lee-list-item__main">{slot}</div>
        {showSuffix ? <div class="lee-list-item__suffix">{suffixSlot}</div> : null}
      </div>
    );
  }
});

export default ListItem;
