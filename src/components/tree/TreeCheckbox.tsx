import { computed, defineComponent, h, PropType, SetupContext } from 'vue';
import { CheckboxType } from './interface';

const allCheckIcon = (
  <svg viewBox="0 0 64 64" class="lee-tree-checkbox-icon" key="all-check">
    <path
      fill="currentColor"
      d="M50.42,16.76L22.34,39.45l-8.1-11.46c-1.12-1.58-3.3-1.96-4.88-0.84c-1.58,1.12-1.95,3.3-0.84,4.88l10.26,14.51  c0.56,0.79,1.42,1.31,2.38,1.45c0.16,0.02,0.32,0.03,0.48,0.03c0.8,0,1.57-0.27,2.2-0.78l30.99-25.03c1.5-1.21,1.74-3.42,0.52-4.92  C54.13,15.78,51.93,15.55,50.42,16.76z"
    ></path>
  </svg>
);

const halfCheckIcon = (
  <svg viewBox="0 0 100 100" class="lee-tree-checkbox-icon" key="half-check">
    <path
      fill="currentColor"
      d="M80.2,55.5H21.4c-2.8,0-5.1-2.5-5.1-5.5l0,0c0-3,2.3-5.5,5.1-5.5h58.7c2.8,0,5.1,2.5,5.1,5.5l0,0C85.2,53.1,82.9,55.5,80.2,55.5z"
    ></path>
  </svg>
);

const TreeCheckbox = defineComponent({
  name: 'TreeCheckBox',
  props: {
    status: {
      type: Number as PropType<CheckboxType>,
      default: CheckboxType.uncheck
    }
  },
  emits: ['click'],
  setup(props, context: SetupContext<['click']>) {
    const checkIcon = computed(() => {
      if (props.status === CheckboxType.halfCheck) {
        return halfCheckIcon;
      }
      if (props.status === CheckboxType.allCheck) {
        return allCheckIcon;
      }
      return null;
    });

    function handleCheckboxCLick(e: MouseEvent) {
      context.emit('click', e);
    }

    return {
      checkIcon,
      handleCheckboxCLick
    };
  },
  render() {
    return (
      <div
        onClick={this.handleCheckboxCLick}
        class={[
          'lee-tree-checkbox',
          this.status === CheckboxType.uncheck ? 'lee-tree-checkbox--uncheck' : null
        ]}
      >
        <span class="lee-tree-checkbox-icon">{this.checkIcon}</span>
      </div>
    );
  }
});

export default TreeCheckbox;
