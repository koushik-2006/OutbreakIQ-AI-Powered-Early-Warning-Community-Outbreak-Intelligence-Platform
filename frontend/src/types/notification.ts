export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: string;
  read: boolean;
  link?: string;
  category: 'alert' | 'investigation' | 'system' | 'source';
}
