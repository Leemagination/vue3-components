import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  ref,
  SetupContext,
  TransitionGroup,
  useModel,
  VNode,
  vShow,
  watch,
  withDirectives
} from 'vue';
import style from './tabs.scss';
import { NavListItem, TabKeyType } from './interface';

const tabsProps = {
  value: {
    type: [String, Number],
    default: undefined
  },
  animated: {
    type: Boolean,
    default: true
  }
};

const setup = (props: ExtractPropTypes<typeof tabsProps>, context: SetupContext) => {
  const activeValue = useModel(props, 'value');
  const transitionName = ref('lee-tab-move-next');
  const tabKeyList = ref<TabKeyType[]>([]);
  const activeRef = ref<HTMLElement | null>(null);
  const activeMarkRef = ref<HTMLElement | null>(null);

  watch([activeRef, activeMarkRef], ([el1, el2]) => {
    if (el2) {
      el2.style.width = '0';
    }
    if (el1 && el2) {
      el2.style.left = `${el1.offsetLeft}px`;
      el2.style.width = `${el1.offsetWidth}px`;
    }
  });

  function handleNavClick(item: NavListItem) {
    activeValue.value = item.key;
  }

  const showAnimated = computed(() => {
    return props.animated;
  });
  watch(activeValue, (newValue, oldValue) => {
    if (!oldValue || !showAnimated.value) {
      return;
    }
    let newIndex = 0;
    let oldIndex = 0;
    tabKeyList.value.forEach((key, index) => {
      if (key === newValue) {
        newIndex = index;
      }
      if (key === oldValue) {
        oldIndex = index;
      }
    });

    if (newIndex >= oldIndex) {
      transitionName.value = 'lee-tab-move-next';
    } else {
      transitionName.value = 'lee-tab-move-prev';
    }
  });

  return {
    activeMarkRef,
    activeRef,
    tabKeyList,
    activeValue,
    transitionName,
    showAnimated,
    handleNavClick
  };
};

const Tabs = defineComponent({
  __STYLE__: style,
  name: 'Tabs',
  props: tabsProps,
  setup,
  render() {
    if (!this.$slots.default) {
      return;
    }
    const panelList = this.$slots.default().filter((item) => {
      return (item.type as any).__TAB_PANEL__;
    });
    const children: VNode[] = [];
    const navList: NavListItem[] = [];
    this.tabKeyList = [];
    panelList.forEach((vNode, index) => {
      if (!vNode.props) {
        vNode.props = {};
      }
      const tabKey = vNode.props['tab-key'];
      navList.push({
        key: tabKey,
        name: vNode.props.name,
        active: tabKey === this.activeValue
      });
      this.tabKeyList.push(tabKey);

      if (!vNode.children) {
        return;
      }
      if (index === 0 && this.activeValue === undefined) {
        this.activeValue = vNode.props['tab-key'];
      }
      let displayType = 'if';
      if (vNode.props['display-type'] === 'show') {
        displayType = 'show';
      }
      const useShow = displayType === 'show';
      if (!vNode.key) {
        vNode.key = vNode.props['tab-key'];
      }
      const show = vNode.props?.['tab-key'] === this.activeValue;
      if (show || useShow) {
        children.push(useShow ? withDirectives(vNode, [[vShow, show]]) : vNode);
      }
    });
    return (
      <div class="lee-tabs-container">
        <div class="lee-tabs-nav-wrapper">
          <div class="lee-tabs-nav-scroll-area">
            {navList.map((item) => {
              return (
                <div
                  ref={
                    ((el: HTMLElement) => {
                      if (item.active) {
                        this.activeRef = el;
                      }
                    }) as () => void
                  }
                  class={['lee-tabs-nav-item', item.active ? 'lee-tabs-nav-item--activated' : null]}
                  onClick={() => this.handleNavClick(item)}
                >
                  {item.name}
                </div>
              );
            })}
          </div>
          <div ref="activeMarkRef" class="lee-tabs-active-mark"></div>
        </div>
        {children.length ? (
          <div class="lee-tabs-content-wrapper">
            {this.showAnimated ? (
              <TransitionGroup duration={200} name={this.transitionName}>
                {children}
              </TransitionGroup>
            ) : (
              children
            )}
          </div>
        ) : null}
      </div>
    );
  }
});

export default Tabs;
