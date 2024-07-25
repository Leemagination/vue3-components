import { createApp, h, ref } from 'vue';
import Drawer from './Drawer';
import { DrawerConfigType } from './interface';

export default function useDrawer(config?: Partial<DrawerConfigType>) {
  const visible = ref(true);

  const modalVNode = createApp({
    render() {
      return h(Drawer, {
        visible: visible.value,
        size: config?.size,
        placement: config?.placement,
        showClose: config?.showClose,
        drawerStyle: config?.drawerStyle,
        zIndex: config?.zIndex,
        title: config?.title,
        content: config?.content,
        maskClosable: config?.maskClosable,
        'onUpdate:visible': (val) => {
          visible.value = val;
        },
        onClosed: () => {
          config?.handleClosed && config.handleClosed();
          modalVNode.unmount();
          containerDom.remove();
        }
      });
    }
  });
  const containerDom = document.createElement('div');
  document.body.appendChild(containerDom);
  modalVNode.mount(containerDom);

  function closeModal() {
    visible.value = false;
  }
  return {
    closeModal
  };
}
