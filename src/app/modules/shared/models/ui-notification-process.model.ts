import { RRHHNotification } from './ui-notifications.model';
import { ProcesResultTotals } from './process-result-totals.model';

export interface NotificationProcess {
    notifications: RRHHNotification[];
    process: ProcesResultTotals[];
    totalNotificationCount: number;
}
