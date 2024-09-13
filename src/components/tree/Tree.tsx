import {
  defineComponent,
  ExtractPropTypes,
  h,
  PropType,
  ref,
  SetupContext,
  shallowRef,
  TransitionGroup,
  unref,
  useModel,
  watch
} from 'vue';
import { CheckboxType, TreeDataItem, TreeNodeDataItem } from './interface';
import style from './tree.scss';
import TreeCheckbox from './TreeCheckbox';

const arrowIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M12 8l10 8l-10 8z" fill="currentColor"></path>
  </svg>
);

const treeProps = {
  data: {
    type: Object as PropType<TreeDataItem[]>,
    default: () => []
  },
  cascade: {
    type: Boolean,
    default: false
  },
  checkKeys: {
    type: Array as PropType<(string | number)[]>,
    default: () => []
  },
  expandAll: {
    type: Boolean,
    default: false
  },
  defaultExpandKeys: {
    type: Array as PropType<(string | number)[]>,
    default: () => []
  }
};

const setup = (
  props: ExtractPropTypes<typeof treeProps>,
  context: SetupContext<['update:checkKeys']>
) => {
  const checkKeysArr = useModel(props, 'checkKeys');
  const displayList = shallowRef<TreeNodeDataItem[]>([]);
  function handleTree(list: TreeDataItem[], level = 0, parent?: TreeNodeDataItem) {
    list.forEach((item) => {
      let checkStatus = CheckboxType.uncheck;

      if (props?.checkKeys?.includes(item.key)) {
        checkStatus = CheckboxType.allCheck;
        if (props.cascade && item.children?.length) {
          checkStatus = CheckboxType.uncheck;
        }
      }
      let expandedStatus = !!props.expandAll;
      if (props.defaultExpandKeys?.includes(item.key)) {
        expandedStatus = true;
      }
      const data: TreeNodeDataItem = {
        ...item,
        checkStatus: ref(checkStatus),
        expanded: ref(expandedStatus),
        __TREE_LEVEL__: level
      };
      if (parent) {
        data.__PARENT_EXPANDED__ = parent.expanded;
      }
      displayList.value.push(data);
      if (Array.isArray(item.children)) {
        handleTree(item.children, level + 1, data);
      }
    });
  }

  watch(
    () => props.data,
    (val) => {
      handleTree(val);
    },
    { immediate: true }
  );

  watch(
    checkKeysArr,
    (val) => {
      const indexArr: number[] = [];
      displayList.value.forEach((item, index) => {
        if (val?.includes(item.key)) {
          item.checkStatus.value = CheckboxType.allCheck;
          if (props.cascade) {
            if (item.children?.length) {
              item.checkStatus.value = CheckboxType.uncheck;
            } else {
              indexArr.push(index);
            }
          }
        } else {
          item.checkStatus.value = CheckboxType.uncheck;
        }
      });
      if (props.cascade) {
        indexArr.forEach((val) => {
          changeItemCheckStatus(displayList.value[val], val);
        });
      }
    },
    { deep: true }
  );

  function changeParentCheck(index: number) {
    const level = displayList.value[index].__TREE_LEVEL__;
    if (level === 0) {
      return;
    }
    const targetStatus = displayList.value[index].checkStatus.value;
    if (targetStatus === CheckboxType.halfCheck) {
      for (let i = index - 1; i >= 0; i--) {
        const item = displayList.value[i];
        const treeLevel = item.__TREE_LEVEL__;
        if (treeLevel === 0) {
          item.checkStatus.value = CheckboxType.halfCheck;
          break;
        }
        if (treeLevel >= level) {
          continue;
        }
        item.checkStatus.value = CheckboxType.halfCheck;
        changeParentCheck(i);
        break;
      }
      return;
    }
    const statusArr: CheckboxType[] = [targetStatus];
    let parentNode = null;
    let parentIndex = null;
    for (let i = index - 1; i >= 0; i--) {
      const item = displayList.value[i];
      const treeLevel = item.__TREE_LEVEL__;
      if (treeLevel > level) {
        continue;
      }
      if (treeLevel === level && statusArr.length === 1) {
        if (item.checkStatus.value !== statusArr[0]) {
          statusArr.push(item.checkStatus.value);
        }
      }
      if (treeLevel < level) {
        parentNode = item;
        parentIndex = i;
        break;
      }
    }
    if (statusArr.length > 1 && parentNode) {
      parentNode.checkStatus.value = CheckboxType.halfCheck;
      changeParentCheck(parentIndex as number);
      return;
    }

    for (let i = index + 1; i < displayList.value.length; i++) {
      const item = displayList.value[i];
      const treeLevel = item.__TREE_LEVEL__;
      if (treeLevel > level) {
        continue;
      }
      if (treeLevel === level) {
        if (item.checkStatus.value !== statusArr[0]) {
          statusArr.push(item.checkStatus.value);
          break;
        }
      }
      if (treeLevel < level) {
        break;
      }
    }

    if (parentNode) {
      if (statusArr.length > 1) {
        parentNode.checkStatus.value = CheckboxType.halfCheck;
        changeParentCheck(parentIndex as number);
      } else {
        parentNode.checkStatus.value = statusArr[0];
        changeParentCheck(parentIndex as number);
      }
    }
  }

  function changeItemCheckStatus(item: TreeNodeDataItem, index: number) {
    if (item.checkStatus.value === CheckboxType.allCheck) {
      if (item.children && item.children.length) {
        const parentLevel = displayList.value[index].__TREE_LEVEL__;
        for (let i = index + 1; i < displayList.value.length; i++) {
          const child = displayList.value[i];
          if (parentLevel >= child.__TREE_LEVEL__) {
            break;
          }
          const checkStatusRef = child.checkStatus;
          if (checkStatusRef.value !== CheckboxType.allCheck) {
            checkStatusRef.value = CheckboxType.allCheck;
            if (!child.children?.length) {
              checkKeysArr.value.push(child.key);
            }
          }
        }
      }

      changeParentCheck(index);

      return;
    }

    if (item.checkStatus.value === CheckboxType.uncheck) {
      if (item.children && item.children.length) {
        const parentLevel = displayList.value[index].__TREE_LEVEL__;
        const removeIndex: (string | number)[] = [];
        for (let i = index + 1; i < displayList.value.length; i++) {
          const child = displayList.value[i];
          if (parentLevel >= child.__TREE_LEVEL__) {
            break;
          }
          const checkStatusRef = child.checkStatus;
          checkStatusRef.value = CheckboxType.uncheck;
          if (!child.children?.length) {
            removeIndex.push(child.key);
          }
        }
        checkKeysArr.value = checkKeysArr.value?.filter((key) => {
          return !removeIndex.includes(key);
        });
      }
      changeParentCheck(index);
      return;
    }
  }

  function handleCheckClick(e: MouseEvent, item: TreeNodeDataItem, index: number) {
    e.stopPropagation();
    if (
      item.checkStatus.value === CheckboxType.uncheck ||
      item.checkStatus.value === CheckboxType.halfCheck
    ) {
      if (!props.cascade) {
        checkKeysArr.value?.push(item.key);
      } else {
        if (item.children?.length) {
          item.checkStatus.value = CheckboxType.allCheck;
          changeItemCheckStatus(item, index);
        } else {
          checkKeysArr.value?.push(item.key);
        }
      }
      return;
    }

    if (item.checkStatus.value === CheckboxType.allCheck) {
      if (!props.cascade) {
        checkKeysArr.value = checkKeysArr.value?.filter((key) => item.key !== key);
      } else {
        if (item.children?.length) {
          item.checkStatus.value = CheckboxType.uncheck;
          changeItemCheckStatus(item, index);
        } else {
          checkKeysArr.value = checkKeysArr.value?.filter((key) => item.key !== key);
        }
      }
      return;
    }
  }

  function handleItemClick(item: TreeNodeDataItem, index: number) {
    item.expanded.value = !item.expanded.value;
    if (!item.expanded.value && item.children?.length) {
      shrinkChildren(index);
    }
  }

  function shrinkChildren(index: number) {
    const parentLevel = displayList.value[index].__TREE_LEVEL__;
    for (let i = index + 1; i < displayList.value.length; i++) {
      const child = displayList.value[i];
      if (parentLevel >= child.__TREE_LEVEL__) {
        break;
      }
      const expandedRef = child.expanded;
      expandedRef.value = false;
    }
  }

  function setTransitionShrink(el: Element) {
    (el as HTMLElement).style.maxHeight = '0';
  }

  function setTransitionExpand(el: Element) {
    let domHeight = (el as HTMLElement).clientHeight;
    if (domHeight === 0) {
      (el as HTMLElement).style.maxHeight = '';
      domHeight = (el as HTMLElement).clientHeight;
      (el as HTMLElement).style.maxHeight = '0';
      setTimeout(() => {
        (el as HTMLElement).style.maxHeight = `${domHeight}px`;
      });
    } else {
      (el as HTMLElement).style.maxHeight = `${domHeight}px`;
    }
  }

  function removeTransitionStyle(el: Element) {
    (el as HTMLElement).style.maxHeight = '';
  }

  return {
    displayList,
    handleItemClick,
    setTransitionShrink,
    setTransitionExpand,
    removeTransitionStyle,
    handleCheckClick
  };
};

const Tree = defineComponent({
  __STYLE__: style,
  name: 'Tree',
  props: treeProps,
  emits: ['update:checkKeys'],
  setup,
  render() {
    return (
      <div class="lee-tree-container">
        {this.displayList.map((item, index) => {
          return (
            <TransitionGroup
              name="lee-tree-fade"
              onBeforeEnter={this.setTransitionShrink}
              onEnter={this.setTransitionExpand}
              onBeforeLeave={this.setTransitionExpand}
              onLeave={this.setTransitionShrink}
              onAfterEnter={this.removeTransitionStyle}
              onAfterLeave={this.removeTransitionStyle}
            >
              {item.__TREE_LEVEL__ && !unref(item.__PARENT_EXPANDED__) ? null : (
                <div
                  class="lee-tree-item"
                  key={item.key}
                  onClick={() => this.handleItemClick(item, index)}
                >
                  {Array.from({ length: item.__TREE_LEVEL__ }).map(() => {
                    return (
                      <span
                        class="lee-tree-level-space"
                        onClick={(ev) => ev.stopPropagation()}
                      ></span>
                    );
                  })}
                  {item.children && item.children.length ? (
                    <span
                      class={[
                        'lee-tree-item-arrow',
                        unref(item.expanded) ? 'lee-tree-item-arrow--expanded' : null
                      ]}
                    >
                      {arrowIcon}
                    </span>
                  ) : null}
                  <TreeCheckbox
                    onClick={(e) => this.handleCheckClick(e, item, index)}
                    status={unref(item.checkStatus)}
                  ></TreeCheckbox>
                  <span>{item.label}</span>
                </div>
              )}
            </TransitionGroup>
          );
        })}
      </div>
    );
  }
});

export default Tree;
