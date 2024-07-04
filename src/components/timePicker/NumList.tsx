import { computed, defineComponent, nextTick, onMounted, PropType, ref } from 'vue';

function formatTimeText(val: number) {
  if (val > 9) {
    return `${val}`;
  }
  return `0${val}`;
}

const NumList = defineComponent({
  props: {
    maxNum: Number,
    activeNum: Number as PropType<number | null>
  },
  emits: ['click'],
  setup(props, context) {
    const list = computed(() => {
      return Array.from({ length: props.maxNum || 0 }).map((_, index) => {
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

    const listWrapperRef = ref<Element | null>(null);

    function scrollActiveItem() {
      const listDom = listWrapperRef.value;
      if (listDom) {
        const activeItem = listDom.querySelector('.lee-time-picker-num-item__active');
        const scrollTop = activeItem?.getBoundingClientRect().top;
        const listTop = listDom.getBoundingClientRect().top;
        if (scrollTop) {
          listDom.scrollTo({
            top: scrollTop - listTop + listDom.scrollTop
          });
        }
      }
    }

    const blankHeight = ref(0);

    function calcBlankHeight() {
      const listDom = listWrapperRef.value;
      if (listDom) {
        const item = listDom.querySelector('.lee-time-picker-num-item');
        if (item) {
          const itemHeight = item?.scrollHeight;
          const listHeight = listDom.getBoundingClientRect().height;
          blankHeight.value = listHeight - itemHeight;
        }
      }
    }

    onMounted(async () => {
      calcBlankHeight();
      await nextTick();
      scrollActiveItem();
    });

    return { blankHeight, listWrapperRef, list, handleItemClick, scrollActiveItem };
  },
  render() {
    return (
      <div ref="listWrapperRef" class="lee-time-picker-num-list">
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
        <div style={{ height: `${this.blankHeight}px` }}></div>
      </div>
    );
  }
});

export default NumList;
