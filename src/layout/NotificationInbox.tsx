import { useState } from "react";
import { useNotifications } from "../notifications/useNotifications";
import type { Notification } from "../notifications/types";

function NotificationInbox() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useNotifications();

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: Notification["type"]): string => {
    const labels: Record<Notification["type"], string> = {
      notice: "공고",
      maintenance: "점검",
      update: "업데이트",
    };
    return labels[type];
  };

  const renderNotificationItem = (notif: Notification) => {
    const content = (
      <div className={`notification-item notification-item--${notif.type}`}>
        <div className="notification-item-header">
          <span className="notification-type-badge">{getTypeLabel(notif.type)}</span>
          <span className="notification-date">{formatDate(notif.createdAt)}</span>
        </div>
        <div className="notification-title">{notif.title}</div>
        <div className="notification-message">{notif.message}</div>
      </div>
    );

    if (notif.link) {
      return (
        <a key={notif.id} href={notif.link} className="notification-link">
          {content}
        </a>
      );
    }

    return (
      <div key={notif.id} className="notification-link">
        {content}
      </div>
    );
  };

  return (
    <div className="notification-inbox-container">
      <button
        className="notification-bell"
        onClick={togglePanel}
        aria-label="알림 열기"
        aria-expanded={isOpen}
      >
        🔔
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h3>알림</h3>
          </div>
          {notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map((notif) => renderNotificationItem(notif))}
            </div>
          ) : (
            <div className="notification-empty">알림이 없습니다</div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationInbox;
