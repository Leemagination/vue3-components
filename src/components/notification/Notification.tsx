import { defineComponent, h, Teleport } from 'vue';
import './notification.scss';
import NotificationItem from './NotificationItem';
import {
  deleteNotificationItem,
  notificationItemRef,
  notificationList,
  notificationPlacement
} from './useNotification';

const ContainerSetup = () => {
  function handleItemClose(key: number) {
    deleteNotificationItem(key);
  }

  return {
    notificationPlacement,
    notificationList,
    notificationItemRef,
    handleItemClose
  };
};

const NotificationContainer = defineComponent({
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
                    if (el) {
                      this.notificationItemRef[notification.key] = el;
                    }
                  }) as () => void
                }
                key={notification.key}
                info={notification}
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
