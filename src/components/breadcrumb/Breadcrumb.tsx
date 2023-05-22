import { defineComponent, h, renderSlot, VNodeChild } from 'vue';
import { cssPrefix } from '../../config/globalConfig';
import './breadcrumb.scss';
const Breadcrumb = defineComponent({
  name: 'Breadcrumb',
  render() {
    const slot = renderSlot(this.$slots, 'default');
    const separator = renderSlot(this.$slots, 'separator');
    if (Array.isArray(slot.children)) {
      const validChildren: VNodeChild[] = [];
      slot.children.forEach((item: any) => {
        if (item.type.name === 'BreadcrumbItem') {
          validChildren.push(item);
          validChildren.push(
            <span class={[`${cssPrefix}-breadcrumb-separator`]}>
              {this.$slots.separator ? separator : '/'}
            </span>
          );
        }
      });
      slot.children = validChildren.slice(0, -1);
    }
    return <div class={[`${cssPrefix}-breadcrumb`]}>{slot}</div>;
  }
});
export default Breadcrumb;
