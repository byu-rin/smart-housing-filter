import { useCallback, useState } from "react";
import type { Notification } from "./types";

const LAST_READ_KEY = "lastReadNotificationId";

function readStoredLastReadId(): string | null {
  try {
    return localStorage.getItem(LAST_READ_KEY);
  } catch {
    return null;
  }
}

function getLatestNotification(notifications: Notification[]): Notification | null {
  if (notifications.length === 0) return null;
  return notifications.reduce((latest, n) =>
    new Date(n.createdAt).getTime() > new Date(latest.createdAt).getTime() ? n : latest
  );
}

export function useNotificationRead(notifications: Notification[]) {
  const [lastReadId, setLastReadId] = useState<string | null>(readStoredLastReadId);

  const lastRead = lastReadId ? notifications.find((n) => n.id === lastReadId) : undefined;
  const unreadCount =
    lastReadId === null || !lastRead
      ? notifications.length
      : notifications.filter(
          (n) => new Date(n.createdAt).getTime() > new Date(lastRead.createdAt).getTime()
        ).length;

  const markAllAsRead = useCallback(() => {
    const latest = getLatestNotification(notifications);
    if (!latest) return;
    try {
      localStorage.setItem(LAST_READ_KEY, latest.id);
    } catch {
      // localStorage 사용 불가(시크릿 모드 등) - 무시하고 메모리 상태만 갱신
    }
    setLastReadId(latest.id);
  }, [notifications]);

  return { unreadCount, markAllAsRead };
}
