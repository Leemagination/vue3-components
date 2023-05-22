import { computed, defineComponent, h, PropType, renderSlot, Fragment } from 'vue';
import {
  DivideDividerStyle,
  DivideLineStyle,
  dividerDirection,
  DividerDirection,
  dividerLineAlign,
  FlexLineStyle,
  LineAlign,
  lineAlignMap
} from './interface';
import { cssPrefix } from '../../config/globalConfig';
import './divider.scss';
import { getPropsValue } from '../../util';
const dividerProps = {
  gradual: Boolean,
  color: {
    type: String,
    default: '#e3e3e3'
  },
  direction: {
    type: String as PropType<DividerDirection>,
    default: 'horizontal'
  },
  horizontalLength: {
    type: Number,
    default: 100,
    validator: function (value: number) {
      return value >= 0 && value <= 100;
    }
  },
  verticalHeight: {
    type: Number,
    default: 1
  },
  horizontalLineAlign: {
    type: String as PropType<LineAlign>,
    default: 'center'
  },
  width: {
    type: Number,
    default: 1,
    validator: function (value: number) {
      return value > 0;
    }
  },
  distanceToLeft: {
    type: Number,
    default: 50,
    validator: function (value: number) {
      return value >= 0 && value <= 100;
    }
  }
};

const Divider = defineComponent({
  name: 'Divider',
  props: dividerProps,
  setup(props) {
    const direction = computed(() => {
      return getPropsValue(props.direction, dividerDirection);
    });
    const horizontalLength = computed(() => {
      return props.horizontalLength;
    });
    const verticalHeight = computed(() => {
      return props.verticalHeight;
    });
    const horizontalLineAlign = computed(() => {
      return getPropsValue(props.horizontalLineAlign, dividerLineAlign);
    });
    const width = computed(() => {
      return props.width;
    });
    const lineProportion = computed(() => {
      const leftRate = props.distanceToLeft;
      const rightRate = 100 - props.distanceToLeft;
      const height = `${props.width}px`;
      let left: FlexLineStyle;
      let right: FlexLineStyle;
      left = {
        flex: leftRate,
        height
      };
      right = {
        flex: rightRate,
        height
      };
      if (leftRate === 0) {
        left = {
          display: 'none',
          height
        };
        right = {
          flex: 1,
          height
        };
      }
      if (rightRate === 0) {
        right = {
          display: 'none',
          height
        };
        left = {
          flex: 1,
          height
        };
      }
      return {
        left,
        right
      };
    });
    const lineColor = computed(() => {
      return props.color;
    });
    return {
      direction,
      length,
      horizontalLineAlign,
      width,
      horizontalLength,
      lineProportion,
      lineColor,
      verticalHeight
    };
  },
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    const customLineStyle: DivideLineStyle = {};
    const customDividerStyle: DivideDividerStyle = {};
    const GRADUAL_DEGREE = 4;
    if (this.direction === 'horizontal') {
      customLineStyle.width = `${this.horizontalLength}%`;
      customDividerStyle.justifyContent = lineAlignMap[this.horizontalLineAlign];
      customLineStyle.height = `${this.width}px`;
      if (this.gradual) {
        customLineStyle.background = `linear-gradient(to right,transparent,${
          this.color
        } ${GRADUAL_DEGREE}%,${this.color} ${100 - GRADUAL_DEGREE}%,transparent)`;
      }
    }
    if (this.direction === 'vertical') {
      customLineStyle.width = `${this.width}px`;
      customLineStyle.background = `linear-gradient(to bottom,transparent,${this.color} ${
        GRADUAL_DEGREE + 4
      }%,${this.color} ${100 - 4 - GRADUAL_DEGREE}%,transparent)`;
      customLineStyle.lineHeight = `${this.verticalHeight}`;
    }
    return (
      <div class={[`${cssPrefix}-${this.direction}-divider`]} style={customDividerStyle}>
        {slot.children?.length ? (
          <>
            <div
              class={[`${cssPrefix}-${this.direction}-divider-left-line`]}
              style={this.lineProportion.left}
            ></div>
            <div class={[`${cssPrefix}-divider-title`]}>{slot}</div>
            <div
              class={[`${cssPrefix}-${this.direction}-divider-right-line`]}
              style={this.lineProportion.right}
            ></div>
          </>
        ) : (
          <div class={[`${cssPrefix}-${this.direction}-divider-line`]} style={customLineStyle}>
            &nbsp;
          </div>
        )}
      </div>
    );
  }
});

export default Divider;
