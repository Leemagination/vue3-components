import { computed, defineComponent, nextTick, onMounted, PropType, ref } from 'vue';
import './numList.scss';
function formatTimeText(val: number) {
  if (val > 9) {
    return `${val}`;
  }
  return `0${val}`;
}

const NumList = defineComponent({
  props: {
    minNum: {
      type: Number,
      default: 0
    },
    maxNum: {
      type: Number,
      default: 0
    },
    activeNum: Number as PropType<number | null>
  },
  emits: ['click'],
  setup(props, context) {
    const list = computed(() => {
      const result = [];
      for (let i = props.minNum; i <= props.maxNum; i++) {
        result.push({
          value: i,
          text: formatTimeText(i),
          active: props.activeNum === i
        });
      }
      return result;
    });

    function handleItemClick(ev: MouseEvent, val: number) {
      ev.stopPropagation();
      ev.preventDefault();
      context.emit('click', val);
    }

    const listWrapperRef = ref<Element | null>(null);

    function scrollActiveItem() {
      const listDom = listWrapperRef.value;
      if (listDom) {
        const activeItem = listDom.querySelector('.lee-date-picker-num-item__active');
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
        const item = listDom.querySelector('.lee-date-picker-num-item');
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
      <div ref="listWrapperRef" class="lee-date-picker-num-list">
        {this.list.map((item) => {
          return (
            <div
              class={[
                'lee-date-picker-num-item',
                item.active ? 'lee-date-picker-num-item__active' : null
              ]}
              onClick={(ev) => this.handleItemClick(ev, item.value)}
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
