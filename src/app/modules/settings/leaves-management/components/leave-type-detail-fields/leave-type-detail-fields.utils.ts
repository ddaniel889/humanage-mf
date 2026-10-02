import { LeaveTypeOuDetailDto } from '../../../../shared/models/Employee';
import {
  getAssignmentDayKey,
  getConsecutiveDaysKey,
  getLeaveStartDayKey,
  getWorkflowApproveKey,
} from '../../utils/rules-keys.utils';

type LeaveTypeFieldLabelKey =
  | 'leaves.fields.workflowApprove.label'
  | 'leaves.fields.leaveMinDays'
  | 'leaves.fields.leaveMaxDays'
  | 'leaves.fields.quantityDays'
  | 'leaves.fields.leaveStartDay.label'
  | 'leaves.fields.useConsecutiveDays.label'
  | 'leaves.fields.assignmentDay.label';

export interface LeaveTypeDetailField {
  labelKey: LeaveTypeFieldLabelKey;
  value: string;
  order?: number;
}

export function getLeaveTypeSummaryFields(
  detail: LeaveTypeOuDetailDto,
): LeaveTypeDetailField[] {
  const fields = [...getBaseFields(detail), ...getRuleFields(detail)];

  return fields.sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });
}

function getBaseFields(detail: LeaveTypeOuDetailDto): LeaveTypeDetailField[] {
  const fields: LeaveTypeDetailField[] = [];

  if (detail.workflowApprove) {
    fields.push({
      labelKey: 'leaves.fields.workflowApprove.label',
      value: getWorkflowApproveKey(detail.workflowApprove.id),
      order: 4,
    });
  }

  return fields;
}

function getRuleFields(detail: LeaveTypeOuDetailDto): LeaveTypeDetailField[] {
  if (!detail.rules?.length) {
    return [];
  }

  const rule = detail.rules[0];
  const fields: LeaveTypeDetailField[] = [];

  if (rule.leaveMinDays !== undefined && rule.leaveMinDays !== null) {
    fields.push({
      labelKey: 'leaves.fields.leaveMinDays',
      value: String(rule.leaveMinDays),
    });
  }

  if (rule.leaveMaxDays !== undefined && rule.leaveMaxDays !== null) {
    fields.push({
      labelKey: 'leaves.fields.leaveMaxDays',
      value: String(rule.leaveMaxDays),
    });
  }

  if (rule.assignmentDayType) {
    fields.push({
      labelKey: 'leaves.fields.assignmentDay.label',
      value: getAssignmentDayKey(rule.assignmentDayType.id, rule.assignmentDayType.title),
      order: 1,
    });
  }

  if (rule.quantityDays !== undefined && rule.quantityDays !== null) {
    fields.push({
      labelKey: 'leaves.fields.quantityDays',
      value: String(rule.quantityDays),
      order: 2,
    });
  }

  if (rule.leaveStartDay) {
    fields.push({
      labelKey: 'leaves.fields.leaveStartDay.label',
      value: getLeaveStartDayKey(rule.leaveStartDay),
      order: 3,
    });
  }

  if (rule.useConsecutiveDays !== undefined && rule.useConsecutiveDays !== null) {
    fields.push({
      labelKey: 'leaves.fields.useConsecutiveDays.label',
      value: getConsecutiveDaysKey(rule.useConsecutiveDays),
      order: 5,
    });
  }

  return fields;
}
