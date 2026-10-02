import { LeaveRulesAssignmentDayType } from "./leave-rules-assignment-day-type";

export class LeaveRules {
  id: number;
  configLeaveOuId?: number;
  leaveTypeOuId?:number;
  leaveMinDays: number;
  leaveMaxDays: number | null;
  leaveStartDay?: string;
  nextAbleDay?: boolean;
  useConsecutiveDays?: boolean;
  assignmentDayType: LeaveRulesAssignmentDayType | null;
  isDocumentRequired?: boolean;
  quantityDays?: number | null;
}

export function getKey(leaveStartDay: string)
{
  switch (leaveStartDay.toLowerCase()) {
    case 'lunes': return 1;
    case 'martes': return 2;
    case 'miércoles': return 3;
    case 'miercoles': return 3;
    case 'jueves': return 4;
    case 'viernes': return 5;
    case 'sabado': return 6;
    case 'domingo': return 0;
    default: return -1;
  }
}
