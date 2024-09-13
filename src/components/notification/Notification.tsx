import { defineComponent, h, Teleport } from 'vue';
import style from './notification.scss';
import NotificationItem from './NotificationItem';
import {
  deleteNotificationItem,
  hideNotificationItem,
  notificationItemRef,
  notificationList,
  notificationPlacement
} from './useNotification';
import { ItemRefStatus } from './interface';

const ContainerSetup = () => {
  function handleItemClose(key: number) {
    deleteNotificationItem(key);
  }

  function handleItemHide(key: number) {
    hideNotificationItem(key);
  }

  return {
    notificationPlacement,
    notificationList,
    notificationItemRef,
    handleItemClose,
    handleItemHide
  };
};

const NotificationContainer = defineComponent({
  __STYLE__: style,
  setup: ContainerSetup,
  render() {
    return (
      <Teleport to="body">
        <div
          class={[
            'lee-notification-container',
            this.notificationPlacement
              ? `lee-notification-container__${this.notificationPlacement}`
              : null
          ]}
        >
          {this.notificationList.map((notification) => {
            return (
              <NotificationItem
                placement={this.notificationPlacement}
                ref={
                  ((el: InstanceType<typeof NotificationItem>) => {
                    if (el && !this.notificationItemRef[notification.key]) {
                      this.notificationItemRef[notification.key] = {
                        ref: el,
                        status: ItemRefStatus.Show
                      };
                    }
                  }) as () => void
                }
                key={notification.key}
                info={notification}
                onHide={() => {
                  this.handleItemHide(notification.key);
                }}
                onClose={() => {
                  this.handleItemClose(notification.key);
                }}
              ></NotificationItem>
            );
          })}
        </div>
      </Teleport>
    );
  }
});

export default NotificationContainer;
