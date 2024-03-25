import { defineComponent, ExtractPropTypes, h, nextTick, ref, renderSlot, SetupContext } from 'vue';
import './card.scss';

const cardProps = {
  title: String,
  content: String,
  footer: String,
  cover: String,
  extraText: String,
  hoverStatus: Boolean,
  closable: Boolean,
  border: Boolean,
  headerClass: String,
  contentClass: String,
  footerClass: String
};
const setup = (props: ExtractPropTypes<typeof cardProps>, context: SetupContext<['closed']>) => {
  const visible = ref(true);
  async function handleCloseClick() {
    if (props.closable) {
      visible.value = false;
      await nextTick();
      context.emit('closed');
    }
  }
  return {
    visible,
    handleCloseClick
  };
};

const Card = defineComponent({
  props: cardProps,
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
    const extraSlot = renderSlot(
      $slots,
      'header-extra',
      {},
      $props.extraText ? () => [$props.extraText] : undefined
    );
    const footerSlot = renderSlot(
      $slots,
      'footer',
      {},
      $props.footer ? () => [$props.footer] : undefined
    );
    const showHeader = headerSlot.children?.length || extraSlot.children?.length || $props.closable;
    const showContent = defaultSlot.children?.length;
    const showFooter = footerSlot.children?.length;
    return this.visible ? (
      <div
        class={[
          'lee-card-container',
          $props.hoverStatus ? 'lee-card-container--hover' : '',
          $props.border ? 'lee-card-container--border' : ''
        ]}
      >
        {$props.cover ? <img class="lee-card-cover" src={$props.cover}></img> : null}
        {showHeader ? (
          <div class={['lee-card-header', $props.headerClass]}>
            <div class="lee-card-header__main">{headerSlot}</div>
            <div class="lee-card-header__extra">
              {extraSlot}
              {this.closable ? (
                <div class="lee-card-header__close" onClick={this.handleCloseClick}>
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 12 12"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g fill="currentColor" fill-rule="nonzero">
                        <path d="M2.08859116,2.2156945 L2.14644661,2.14644661 C2.32001296,1.97288026 2.58943736,1.95359511 2.7843055,2.08859116 L2.85355339,2.14644661 L6,5.293 L9.14644661,2.14644661 C9.34170876,1.95118446 9.65829124,1.95118446 9.85355339,2.14644661 C10.0488155,2.34170876 10.0488155,2.65829124 9.85355339,2.85355339 L6.707,6 L9.85355339,9.14644661 C10.0271197,9.32001296 10.0464049,9.58943736 9.91140884,9.7843055 L9.85355339,9.85355339 C9.67998704,10.0271197 9.41056264,10.0464049 9.2156945,9.91140884 L9.14644661,9.85355339 L6,6.707 L2.85355339,9.85355339 C2.65829124,10.0488155 2.34170876,10.0488155 2.14644661,9.85355339 C1.95118446,9.65829124 1.95118446,9.34170876 2.14644661,9.14644661 L5.293,6 L2.14644661,2.85355339 C1.97288026,2.67998704 1.95359511,2.41056264 2.08859116,2.2156945 L2.14644661,2.14644661 L2.08859116,2.2156945 Z"></path>
                      </g>
                    </g>
                  </svg>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        {showContent ? (
          <div class={['lee-card-content', $props.contentClass]}>{defaultSlot}</div>
        ) : null}
        {showFooter ? (
          <div class={['lee-card-footer', $props.footerClass]}>{footerSlot}</div>
        ) : null}
      </div>
    ) : null;
  }
});

export default Card;
