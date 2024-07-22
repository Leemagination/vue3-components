import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  ref,
  renderSlot,
  SetupContext,
  Teleport,
  Transition,
  useModel,
  watch
} from 'vue';
import { createZIndex } from '../../util/zIndex';
import './modal.scss';
import { modalEmits, ModalEmitType } from './interface';

const closeIcon = (
  <svg viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g fill="currentColor" fill-rule="nonzero">
        <path d="M2.08859116,2.2156945 L2.14644661,2.14644661 C2.32001296,1.97288026 2.58943736,1.95359511 2.7843055,2.08859116 L2.85355339,2.14644661 L6,5.293 L9.14644661,2.14644661 C9.34170876,1.95118446 9.65829124,1.95118446 9.85355339,2.14644661 C10.0488155,2.34170876 10.0488155,2.65829124 9.85355339,2.85355339 L6.707,6 L9.85355339,9.14644661 C10.0271197,9.32001296 10.0464049,9.58943736 9.91140884,9.7843055 L9.85355339,9.85355339 C9.67998704,10.0271197 9.41056264,10.0464049 9.2156945,9.91140884 L9.14644661,9.85355339 L6,6.707 L2.85355339,9.85355339 C2.65829124,10.0488155 2.34170876,10.0488155 2.14644661,9.85355339 C1.95118446,9.65829124 1.95118446,9.34170876 2.14644661,9.14644661 L5.293,6 L2.14644661,2.85355339 C1.97288026,2.67998704 1.95359511,2.41056264 2.08859116,2.2156945 L2.14644661,2.14644661 L2.08859116,2.2156945 Z"></path>
      </g>
    </g>
  </svg>
);

const modalProps = {
  showClose: {
    type: Boolean,
    default: true
  },
  modalStyle: {
    type: Object,
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  },
  zIndex: {
    type: Number,
    default: undefined
  },
  title: String,
  content: String,
  showCancel: Boolean,
  showConfirm: Boolean,
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  maskClosable: {
    type: Boolean,
    default: true
  }
};
const setup = (
  props: ExtractPropTypes<typeof modalProps>,
  context: SetupContext<Array<ModalEmitType>>
) => {
  const visibleValue = useModel(props, 'visible');

  const inTransition = ref(false);
  const modalZIndex = ref(createZIndex());
  const modalVisible = ref(props.visible);

  const originOverflow = document.documentElement.style.overflow;

  const showFooter = computed(() => {
    return props.showConfirm || props.showCancel;
  });

  watch(visibleValue, (val) => {
    if (val) {
      modalZIndex.value = createZIndex(modalZIndex.value);
      modalVisible.value = true;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = originOverflow;
    }
  });

  const zIndex = computed(() => {
    return props.zIndex || modalZIndex.value;
  });

  function closeModal() {
    visibleValue.value = false;
  }

  function handleMaskClick(e: MouseEvent) {
    if (props.maskClosable) {
      closeModal();
    }
    context.emit('maskClick', e);
  }

  function handleModalClosed() {
    inTransition.value = false;
    modalVisible.value = false;
    context.emit('closed');
  }

  function changeTransitionStatus(flag: boolean) {
    inTransition.value = flag;
  }

  function handleCancelClick(e: MouseEvent) {
    context.emit('cancelClick', e);
  }

  function handleConfirmClick(e: MouseEvent) {
    context.emit('confirmClick', e);
  }

  return {
    visibleValue,
    modalVisible,
    zIndex,
    showFooter,
    changeTransitionStatus,
    handleMaskClick,
    handleModalClosed,
    closeModal,
    handleCancelClick,
    handleConfirmClick
  };
};

const Modal = defineComponent({
  name: 'Modal',
  props: modalProps,
  emits: modalEmits,
  setup,
  render() {
    const { $slots, $props } = this;
    const defaultSlot = renderSlot(
      $slots,
      'default',
      {},
      $props.content ? () => [$props.content] : undefined
    );
    const headerSlot = renderSlot(
      $slots,
      'header',
      {},
      $props.title ? () => [$props.title] : undefined
    );
    const footerSlot = renderSlot($slots, 'footer', {}, () => [
      <div class="lee-modal-content__footer">
        {this.showCancel ? (
          <div onClick={this.handleCancelClick} class="lee-modal-content__footer-button">
            {this.cancelText}
          </div>
        ) : null}
        {this.showConfirm ? (
          <div
            onClick={this.handleConfirmClick}
            class="lee-modal-content__footer-button lee-modal-content__footer-button--confirm"
          >
            {this.confirmText}
          </div>
        ) : null}
      </div>
    ]);
    return (
      <>
        {this.modalVisible ? (
          <Teleport to="body">
            <div class="lee-modal-container" style={{ zIndex: this.zIndex }}>
              <div class="lee-modal-content-container">
                <Transition name="lee-modal-mask-fade" appear>
                  {this.visibleValue ? (
                    <div class="lee-modal-mask" onClick={this.handleMaskClick}></div>
                  ) : null}
                </Transition>
                <Transition
                  duration={500}
                  name="lee-modal-content-fade"
                  appear
                  onBeforeLeave={() => this.changeTransitionStatus(true)}
                  onAfterLeave={() => this.handleModalClosed()}
                >
                  {this.visibleValue ? (
                    <div class="lee-modal-content" style={this.modalStyle}>
                      <div class="lee-modal-content__header">
                        <span class="lee-modal-content__header-title">{headerSlot}</span>
                        {this.showClose ? (
                          <span
                            class="lee-modal-content__header-close"
                            onClick={() => this.closeModal()}
                          >
                            {closeIcon}
                          </span>
                        ) : null}
                      </div>
                      <div class="lee-modal-content__main">{defaultSlot}</div>
                      {this.showFooter ? footerSlot : null}
                    </div>
                  ) : null}
                </Transition>
              </div>
            </div>
          </Teleport>
        ) : null}
      </>
    );
  }
});

export default Modal;
