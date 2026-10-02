import { Holiday } from '../calendar-holidays';
import { LeaveTypeOu } from './leave-type-ou.model';

export class ConfigLeaveOu {
  renewalMonthKey: number;
  renewalMonthName: string;
  expirationDays: number;
  expirationMonth: number;
  leaveTypeOu: LeaveTypeOu | null;
  id: number;
  description: string;
  year: string;
  dateFrom: Date;
  dateTo: Date;
  organizationalUnitId: number;
  enabled: boolean;
  configHolidays: Holiday[];
}
