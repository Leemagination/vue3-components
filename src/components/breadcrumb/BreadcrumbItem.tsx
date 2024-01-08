import { defineComponent, h, PropType } from 'vue';

import './breadcrumbItem.scss';
import { MouseFunc } from '../../config/interface';
const BreadcrumbItem = defineComponent({
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
    return (
      <span class={['lee-breadcrumb-item']} onClick={(e) => this.handleCLick(e)}>
        {this.href === null ? $slots : <a href={this.href}>{$slots}</a>}
      </span>
    );
  }
});
export default BreadcrumbItem;
