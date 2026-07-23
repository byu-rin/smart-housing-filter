import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNotifications } from "./useNotifications";
import type { Notification } from "./types";

const DISPLAYED_NOTIFICATIONS_KEY = "displayedNotificationIds";

// local storage 에서 이미 표시된 알림들의 id 읽음.
function readDisplayedIds(): string[] {
  try {
    const stored = localStorage.getItem(DISPLAYED_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 표시된 알림들의 ID 를 local storage 에 저장
function saveDisplayedIds(ids: string[]): void {
  try {
    localStorage.setItem(DISPLAYED_NOTIFICATIONS_KEY, JSON.stringify(ids));
  } catch {
    // localStorage 사용 불가(시크릿 모드 등) - 무시
  }
}

// 알림 타입, 우선순위 기반 결정
function getToastType(notification: Notification): "info" | "warning" | "error" | "success" {
  if (notification.priority === "important") {
    return notification.type === "maintenance" ? "warning" : "success";
  }
  return "info";
}

// local storage 대조 후 새 알림만 toast 띄움
export function useNotificationToast() {
  const notifications = useNotifications();

  useEffect(() => {
    const displayedIds = readDisplayedIds();
    const newNotifications = notifications.filter((n) => !displayedIds.includes(n.id));

    if (newNotifications.length > 0) {
      newNotifications.forEach((notification) => {
        const toastType = getToastType(notification);
        toast[toastType](notification.title);
      });

      const updatedIds = [...displayedIds, ...newNotifications.map((n) => n.id)];
      saveDisplayedIds(updatedIds);
    }
  }, [notifications]);
}
