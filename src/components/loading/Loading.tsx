import { computed, defineComponent, h } from 'vue';

import './loading.scss';
const loadingProps = {
  radius: {
    type: Number,
    default: 6
  },
  speed: {
    type: Number,
    default: 0.7
  },
  width: {
    type: Number,
    default: 2
  },
  color: {
    type: String,
    default: '#1184f5'
  }
};
const LoadingSvg = defineComponent({
  name: 'Loading',
  props: loadingProps,
  setup(props) {
    const radius = computed(() => {
      return props.radius;
    });
    const speed = computed(() => {
      return props.speed;
    });
    const canvasWidth = computed(() => {
      return props.radius * 2 + props.width * 2;
    });
    const stokeColor = computed(() => {
      return props.color;
    });
    const stokeWidth = computed(() => {
      return props.width;
    });
    const drawParams = computed(() => {
      return `M ${radius.value + stokeWidth.value},${stokeWidth.value} A${radius.value},${
        radius.value
      } 0 0,1 ${radius.value + stokeWidth.value},${radius.value * 2 + stokeWidth.value}`;
    });
    return { radius, speed, canvasWidth, stokeColor, drawParams, stokeWidth };
  },
  render() {
    return (
      <svg
        width={this.canvasWidth}
        height={this.canvasWidth}
        class={['lee-loading-svg']}
        style={{ animationDuration: `${this.speed}s` }}
      >
        <path
          d={this.drawParams}
          stroke={this.stokeColor}
          stroke-width={this.stokeWidth}
          style="fill:none;stroke-linecap:round"
        ></path>
      </svg>
    );
  }
});

export default LoadingSvg;
