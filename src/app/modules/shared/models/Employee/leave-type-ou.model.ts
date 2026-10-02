import { LeaveGroupOu } from './leave-group.model';
import { LeaveType } from './leave-type.model';

export interface LeaveTypeOu {
  id: number;
  isAccumulateDays: boolean;
  isAccumulateAdditionalDays: boolean;
  organizationalUnitId: number;
  useNotifyDocument: boolean;
  documentationtypeId: number;
  leaveType: LeaveType;
  workflowApprove?: WorkflowApproveType;
  leaveGroupOu: LeaveGroupOu;
}

export interface WorkflowApproveType {
  id: number;
  description: string;
}

export interface LeaveTypeGroupResponse {
    leaveTypeId: number;
    description: string;
    leaveTypeOuId?: number;
}

export interface LeaveTypeOuSummaryResponse {
  leaveTypeOuSummaries: LeaveTypeOuSummary[];
  countLeaveTypeOu: number;
}

export interface LeaveTypeOuSummary {
  leaveTypeId: number;
  description: string;
  groups: LeaveGroupOu[];
}

export interface CreateLeaveTypeOuWithRulesPayload {
  leaveTypeOu: CreateLeaveTypeOuPayload;
  leaveRules: CreateLeaveRulesPayload;
}

export interface CreateLeaveTypeOuWithRulesResponse {
  leaveTypeOu: LeaveTypeOu & { id: number };
  leaveRules: CreateLeaveRulesPayload & { id: number; leaveTypeOuId: number; };
};

export interface CreateLeaveTypeOuPayload {
  isAccumulateDays: boolean;
  isAccumulateAdditionalDays: boolean;
  leaveTypeId: number;
  organizationalUnitId: number;
  useNotifyDocument: boolean;
  documentationtypeId: number;
  workflowApproveId?: number | null;
  leaveGroupOuId: number;
}

export interface CreateLeaveRulesPayload {
  configLeaveOuId: number;
  assignmentDayTypeId?: number;
  quantityDays?: number | null;
  leaveMinDays?: number;
  leaveMaxDays?: number | null;
  leaveStartDay?: string;
  nextAbleDay?: boolean;
  useConsecutiveDays?: boolean;
  isDocumentRequired?: boolean;
}

export interface UpdateLeaveTypeOuPayload {
  configLeaveOuId: number;
  leaveTypeOuId: number;
  assignmentDayTypeId?: number;
  quantityDays?: number;
  leaveMinDays?: number;
  leaveMaxDays?: number;
  leaveStartDay?: string;
  nextAbleDay?: boolean;
  useConsecutiveDays?: boolean;
  workflowApproveId?: number | null;
  isDocumentRequired?: boolean;
}

export type UpdateLeaveTypeOuResponse = UpdateLeaveTypeOuPayload;
