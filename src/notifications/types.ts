// 알림 시스템 데이터 모델 (공고와 독립적)
// 공고 등록 알림 + 일반 공지(점검, 업데이트 등) 저장 용도

export type NotificationType = "notice" | "maintenance" | "update";
export type NotificationPriority = "normal" | "important";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;   // ISO 8601 문자열 (예: "2026-07-21T10:00:00+09:00")
  link?: string;       // 클릭 시 이동할 경로/URL (선택)
  priority: NotificationPriority;
}
