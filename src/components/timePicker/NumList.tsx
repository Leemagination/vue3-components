import { computed, defineComponent, ref } from 'vue';

function formatTimeText(val: number) {
  if (val > 9) {
    return `${val}`;
  }
  return `0${val}`;
}

const NumList = defineComponent({
  props: {
    maxNum: Number,
    activeNum: [Number, null]
  },
  emits: ['click'],
  setup(props, context) {
    const list = computed(() => {
      return Array.from({ length: props.maxNum }).map((_, index) => {
        return {
          value: index,
          text: formatTimeText(index),
          active: props.activeNum === index
        };
      });
    });

    function handleItemClick(val: number) {
      context.emit('click', val);
    }

    return { list, handleItemClick };
  },
  render() {
    return (
      <div class="lee-time-picker-num-list">
        {this.list.map((item) => {
          return (
            <div
              class={[
                'lee-time-picker-num-item',
                item.active ? 'lee-time-picker-num-item__active' : null
              ]}
              onClick={() => this.handleItemClick(item.value)}
            >
              {item.text}
            </div>
          );
        })}
      </div>
    );
  }
});

export default NumList;
