export interface ValidationRuleOption<T> {
  value: T;
  description: string;
}

export interface ValidationRule<T> {
  defaultValue: T;
  canModify: boolean;
  options: ValidationRuleOption<T>[] | null;
}

export interface ValidationRules {
  leaveMinDays: ValidationRule<number> | null;
  leaveMaxDays: ValidationRule<number> | null;
  leaveStartDay: ValidationRule<string> | null;
  nextAbleDay: ValidationRule<boolean> | null;
  useConsecutiveDays: ValidationRule<boolean> | null;
  workflowApproveId: ValidationRule<number> | null;
  assignmentDay: ValidationRule<number> | null;
  quantityDays: ValidationRule<number> | null;
}
