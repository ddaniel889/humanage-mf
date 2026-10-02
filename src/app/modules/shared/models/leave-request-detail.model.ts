import { Approver } from "./Employee/approver.model";
import { ConfigLeaveEmployee } from "./Employee/config-leave-employee.model";
import { ConfigLeaveOu } from "./Employee/config-leave-ou.model";
import { LeaveState } from "./Employee/leave-state.model";
import { LeaveTypeOu } from "./Employee";
import { LeaveApprovers } from "./approvers.model";

export class LeaveRequestDetail {//
  id: string;
  userName: string;
  userId:number;
  documentId: number;
  userIdFiscal: string;
  userEmail: string;
  userTelephone: string;
  legajo: string;
  organizationalUnitId: number;
  requestDate: Date;
  expirationDate: Date;
  startDate: Date;
  endDate: Date;
  note: string;
  configLeaveEmployee: ConfigLeaveEmployee;
  configLeaveOu: ConfigLeaveOu;
  state: LeaveState;
  stateHistory: LeaveState[];
  daysConsumed: number;
  availableDays: number;
  totalDays: number;
  actionApprovers: LeaveApprovers[];
  createdBy:Approver;
  leaveTypeOu: LeaveTypeOu;
}
