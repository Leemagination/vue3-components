import { createApp, h, ref } from 'vue';
import Modal from './Modal';
import { ModalConfigType } from './interface';

export default function useModal(config?: Partial<ModalConfigType>) {
  const visible = ref(true);

  const modalVNode = createApp({
    render() {
      return h(Modal, {
        visible: visible.value,
        showClose: config?.showClose,
        modalStyle: config?.modalStyle,
        zIndex: config?.zIndex,
        title: config?.title,
        content: config?.content,
        showCancel: config?.showCancel,
        showConfirm: config?.showConfirm,
        cancelText: config?.cancelText,
        confirmText: config?.confirmText,
        maskClosable: config?.maskClosable,
        'onUpdate:visible': (val) => {
          visible.value = val;
        },
        onClosed: () => {
          config?.handleClosed && config.handleClosed();
          modalVNode.unmount();
          containerDom.remove();
        },
        onConfirmClick: (e: MouseEvent) => {
          config?.handleConfirm && config.handleConfirm(e);
        },
        onCancelClick: (e: MouseEvent) => {
          config?.handleCancel && config.handleCancel(e);
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
