import {
  computed,
  createVNode,
  defineAsyncComponent,
  defineComponent,
  ExtractPropTypes,
  h,
  PropType,
  ref,
  renderSlot,
  SetupContext,
  useModel,
  watch
} from 'vue';
import StarIcon from './StarIcon';
import HeartIcon from './HeartIcon';
import CupIcon from './CupIcon';
import FireIcon from './FireIcon';
import style from './rate.scss';
import { JSX } from 'vue/jsx-runtime';
import { RateIconType } from './interface';
const iconMap: Record<RateIconType, JSX.Element> = {
  star: StarIcon,
  heart: HeartIcon,
  cup: CupIcon,
  fire: FireIcon
};

const rateProps = {
  allowHalf: Boolean,
  clearable: {
    type: Boolean,
    default: false
  },
  iconType: {
    type: String as PropType<RateIconType>,
    default: 'star'
  },
  color: {
    type: String,
    default: '#ffb838'
  },
  count: {
    type: Number,
    default: 5
  },
  readonly: Boolean,
  value: Number
};

const setup = (props: ExtractPropTypes<typeof rateProps>, context: SetupContext<['change']>) => {
  const selecting = ref(false);
  const selectingValue = ref(0);
  const rateValue = useModel(props, 'value');
  const rateIcon = computed(() => {
    const target = iconMap[props.iconType];
    if (target) {
      return createVNode(target);
    }
    return createVNode(StarIcon);
  });

  const currentValue = computed(() => {
    return selecting.value ? selectingValue.value : rateValue.value || 0;
  });

  const rateLength = computed(() => {
    if (typeof props.count === 'number' && props.count >= 1) {
      return Math.floor(props.count);
    }
    return 5;
  });

  watch(rateValue, (val) => {
    context.emit('change', val);
  });

  function handleClick(value: number) {
    if (value === rateValue.value && props.clearable) {
      rateValue.value = 0;
    } else {
      rateValue.value = value;
    }
  }

  function handleMouseover(e: MouseEvent, value: number) {
    selecting.value = true;
    selectingValue.value = value;
  }

  function handleMouseLeave() {
    selecting.value = false;
  }

  return { rateIcon, rateLength, currentValue, handleMouseover, handleMouseLeave, handleClick };
};

const Rate = defineComponent({
  __STYLE__: style,
  name: 'Rate',
  props: rateProps,
  setup,
  render() {
    const rateList = new Array(this.rateLength).fill(null).map((_, index) => {
      const value = index + 1;
      const halfValue = index + 0.5;
      const slot = renderSlot(this.$slots, 'default');
      const showSlot = slot.children?.length;
      return (
        <div
          key={index}
          class={['lee-rate-item', this.readonly ? 'lee-rate-item--readonly' : null]}
        >
          <span
            class={[
              'lee-rate-item__full',
              this.currentValue >= value ? 'lee-rate-item--active' : null
            ]}
            style={{ color: this.currentValue >= value ? this.color : undefined }}
            onClick={() => this.handleClick(value)}
            onMouseover={(ev) => this.handleMouseover(ev, value)}
          >
            <span class="lee-rate-icon">{showSlot ? slot : this.rateIcon}</span>
          </span>
          {this.allowHalf ? (
            <span
              class={[
                'lee-rate-item__half',
                this.currentValue >= halfValue ? 'lee-rate-item--active' : null
              ]}
              style={{ color: this.currentValue >= halfValue ? this.color : undefined }}
              onClick={() => this.handleClick(halfValue)}
              onMouseover={(ev) => this.handleMouseover(ev, halfValue)}
            >
              <span class="lee-rate-icon">{showSlot ? slot : this.rateIcon}</span>
            </span>
          ) : null}
        </div>
      );
    });
    return (
      <div class="lee-rate" onMouseleave={this.handleMouseLeave}>
        {rateList}
      </div>
    );
  }
});

export default Rate;
