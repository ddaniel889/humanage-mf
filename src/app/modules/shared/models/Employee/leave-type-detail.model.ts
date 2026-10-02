import { LeaveTypeOu } from './leave-type-ou.model';
import { LeaveRules } from '../leave-rules.model';

export interface LeaveTypeDetailDto {
  leaveTypesOu: LeaveTypeOuDetailDto[];
}

export interface LeaveTypeOuDetailDto extends LeaveTypeOu {
  rules: LeaveRules[];
}
