import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNotifications } from "./useNotifications";
import type { Notification } from "./types";

const DISPLAYED_NOTIFICATIONS_KEY = "displayedNotificationIds";

function readDisplayedIds(): string[] {
  try {
    const stored = localStorage.getItem(DISPLAYED_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDisplayedIds(ids: string[]): void {
  try {
    localStorage.setItem(DISPLAYED_NOTIFICATIONS_KEY, JSON.stringify(ids));
  } catch {
    // localStorage 사용 불가(시크릿 모드 등) - 무시
  }
}

function getToastType(notification: Notification): "info" | "warning" | "error" | "success" {
  if (notification.priority === "important") {
    return notification.type === "maintenance" ? "warning" : "success";
  }
  return "info";
}

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
