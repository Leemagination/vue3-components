import { defineComponent, renderSlot } from 'vue';

const TabPanel = defineComponent({
  name: 'TabPanel',
  props: {
    displayType: {
      type: String,
      default: 'if'
    },
    tabKey: {
      type: [String, Number],
      default: undefined
    },
    name: String
  },
  __TAB_PANEL__: true,
  render() {
    const slot = renderSlot(this.$slots, 'default');
    return <div class="lee-tab-panel">{slot}</div>;
  }
});

export default TabPanel;
