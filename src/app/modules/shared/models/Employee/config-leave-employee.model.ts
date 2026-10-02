import { LeaveTimeLine } from '../times-lines.model';
import { AdditionalDays } from './additional-type.model';
import { LeaveApprovers } from '../approvers.model';
import { ConfigEmployeeAprover } from './config-employee-aprovers.model';
import { ConfigLeaveOu } from './config-leave-ou.model';
import { LeaveType } from './leave-type.model';

export interface ConfigLeaveEmployee {
  id: number;
  userId?: number;
  configLeaveOuId?: number;
  baseDays: number;
  additionalDays: AdditionalDays[];
  configTimeLines: LeaveTimeLine[];
  configApprovers: LeaveApprovers[];
  daysConsumed: number;
  dateLastModified: Date;
  expirationDate?: Date;
  leaveType: LeaveType;
  additionalDaysSum: number;
  configLeaveOu: ConfigLeaveOu;
  configEmployeesTimeLines: ConfigEmployeesTimeLines[];
  configEmployeeApprovers: ConfigEmployeeAprover[];
}

export interface ConfigEmployeesTimeLines {
  configLeaveEmployeeId: number;
  configTimeLineId: number;
  enabled: boolean;
}
