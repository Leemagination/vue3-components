import { defineComponent, h, PropType, renderSlot } from 'vue';
import style from './breadcrumbItem.scss';
import { MouseFunc } from '../../config/interface';

const BreadcrumbItem = defineComponent({
  __STYLE__: style,
  name: 'BreadcrumbItem',
  props: {
    href: {
      type: String,
      default: null
    },
    onClick: Function as PropType<MouseFunc>
  },
  setup(props) {
    function handleCLick(e: MouseEvent): void {
      const { onClick } = props;
      onClick && onClick(e);
    }
    return {
      handleCLick
    };
  },
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    return (
      <span class={['lee-breadcrumb-item']} onClick={(e) => this.handleCLick(e)}>
        {this.href === null ? slot : <a href={this.href}>{slot}</a>}
      </span>
    );
  }
});
export default BreadcrumbItem;
