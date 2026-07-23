// notifications.json을 로컬 import로 로드해 반환하는 훅
// 현재는 정적 로컬 데이터만 사용한다 (fetch 전환은 이번 범위 밖)
import notificationsData from "./data/notifications.json";
import type { Notification } from "./types";

const notifications = notificationsData as unknown as Notification[];

export function useNotifications(): Notification[] {
  return notifications;
}
