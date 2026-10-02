export class LeaveRulesAssignmentDayType {
  id: number;
  title: string;
  description: string;
}

export const AssignmentDayType = {
  MANUAL_PER_YEAR: 1,
  PER_YEAR: 2,
  PER_REQUEST: 3,
  NO_LIMIT: 4,
} as const;
