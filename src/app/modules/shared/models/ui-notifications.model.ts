export class UiNotifications {
  id: string;
  code: string;
  count: number;
  description: string;
  firstName: string;
  lastName: string;
  documentationTypeId: number;
  documentationTypeName: string;
  subtype: string;
  documentId: number;
}

export interface UINotificationDTO {
  id?: string;
  code: string;
  creationDate?: Date;
  entity?: any;
  userId?: number;
}

export interface RRHHNotification {
  id: string;
  code: string;
  creationDate: Date;
  notif: UINotificationDTO;
  icon?: string;
  description?: string;
  subtitle?: string;
  actionName?: string;
  actionIcon?: string;
  action?: string;
}
