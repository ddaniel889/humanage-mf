import { LeaveApprovers } from './approvers.model';
import { Approver } from './Employee/approver.model';
import { LeaveTypeOu, WorkflowApproveType } from './Employee/leave-type-ou.model';

export class LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userIdFiscal: string;
  requestDate: Date;
  expirationDate: Date;
  startDate: Date;
  endDate: Date;
  leaveTypeName: string;//
  leaveTypeId: number;
  stateName: string;
  stateId: string;
  note: string;
  daysConsumed: number;
  selected: boolean;
  organizationalUnitId: number;
  actionApprovers: LeaveApprovers[];
  documentId: number;
  createdBy: Approver;
  workflowApproveType?: WorkflowApproveType;
  leaveTypeOu: LeaveTypeOu;
}
