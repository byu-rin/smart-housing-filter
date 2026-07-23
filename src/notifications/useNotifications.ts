// notifications.json을 로컬 import로 로드해 반환하는 Hook (추후 fetch 전환)
import notificationsData from "./data/notifications.json";
import type { Notification } from "./types";

const notifications: Notification[] = notificationsData.map((item) => ({
  id: item.id,
  type: item.type as Notification["type"],
  title: item.title,
  message: item.message,
  createdAt: item.createdAt,
  link: item.link ?? undefined, // 업뎃공지는 클릭되지 않음
  priority: item.priority as Notification["priority"]
}));

export function useNotifications(): Notification[] {
  return notifications;
}
