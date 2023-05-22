import { computed, defineComponent, h, PropType } from 'vue';
import './progress.scss';
import { ColorConfig, ProgressStatus, ProgressType } from './interface';
import { cssPrefix } from '../../config/globalConfig';
const progressProps = {
  type: {
    type: String as PropType<ProgressType>,
    default: 'line'
  },
  colorConfig: {
    type: Object as PropType<ColorConfig>,
    default: {}
  },
  status: String as PropType<ProgressStatus>,
  gradient: {
    type: String,
    default: null
  },
  width: {
    type: Number,
    default: 8
  },
  radius: {
    type: Number,
    default: 50
  },
  percent: {
    type: Number,
    default: 0
  },
  showValue: {
    type: Boolean,
    default: true
  }
};

const Progress = defineComponent({
  name: 'Progress',
  props: progressProps,
  setup(props, context) {
    const validPercent = computed(() => {
      if (props.percent < 0) {
        return 0;
      }
      if (props.percent > 100) {
        return 100;
      }
      return props.percent;
    });
    const validWidth = computed(() => {
      if (props.width < 4) {
        return 4;
      }
      return props.width;
    });
    const valueSize = computed(() => {
      return 8 * (validWidth.value / 8);
    });
    const progressColor = computed(() => {
      const defaultConfig = {
        normal: '#1184f5',
        success: '#46d55b',
        warning: '#ffc763',
        error: '#ff5656'
      };
      const colorConfig = Object.assign(defaultConfig, props.colorConfig);
      if (props.status && colorConfig[props.status]) {
        return colorConfig[props.status];
      }
      return validPercent.value === 100 ? colorConfig?.success : colorConfig?.normal;
    });
    const validRadius = computed(() => {
      if (props.radius < 10) {
        return 10;
      }
      return props.radius;
    });
    return {
      validPercent,
      validWidth,
      valueSize,
      progressColor,
      validRadius
    };
  },
  render() {
    if (this.type === 'circle') {
      const center = this.validRadius + this.validWidth / 2;
      const svgWidth = this.validRadius * 2 + this.validWidth;
      const circleLen = Math.PI * 2 * this.validRadius;
      return (
        <svg width={svgWidth} height={svgWidth}>
          <g style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
            <circle
              cx={center}
              cy={center}
              r={this.validRadius}
              stroke-width={this.validWidth}
              stroke="#e3e3e3"
              fill="none"
            ></circle>
            <circle
              cx={center}
              cy={center}
              r={this.validRadius}
              stroke-width={this.validWidth}
              stroke={this.progressColor}
              stroke-dasharray={`${circleLen * (this.validPercent / 100)} ${circleLen}`}
              stroke-linecap={this.validPercent ? 'round' : undefined}
              fill="none"
            ></circle>
          </g>
          {this.showValue ? (
            <text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle">
              {this.validPercent}%
            </text>
          ) : null}
        </svg>
      );
    }
    return (
      <div class={[`${cssPrefix}-progress-container`]}>
        <div class={[`${cssPrefix}-progress-track`]} style={{ height: `${this.validWidth}px` }}>
          <div
            class={[`${cssPrefix}-progress`]}
            style={{
              width: `${this.validPercent}%`,
              background: `${this.progressColor}`,
              backgroundImage: `${this.gradient}`
            }}
          ></div>
        </div>
        {this.showValue ? (
          <div class={[`${cssPrefix}-percent`]} style={{ fontSize: `${this.valueSize}px` }}>
            {this.validPercent}%
          </div>
        ) : null}
      </div>
    );
  }
});
export default Progress;
