import { defineComponent, h, renderSlot, VNodeChild } from 'vue';
import style from './breadcrumb.scss';

const Breadcrumb = defineComponent({
  __STYLE__: style,
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
            <span class={['lee-breadcrumb-separator']}>
              {this.$slots.separator ? separator : '/'}
            </span>
          );
        }
      });
      slot.children = validChildren.slice(0, -1);
    }
    return <div class={['lee-breadcrumb']}>{slot}</div>;
  }
});
export default Breadcrumb;
