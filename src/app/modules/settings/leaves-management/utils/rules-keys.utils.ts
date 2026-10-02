import { AssignmentDayType } from '@shared/models/leave-rules-assignment-day-type';

export const LEAVE_START_ANY_DAY = 'cualquier día';

const LEAVE_START_DAY_KEY_MAP: Record<string, string> = {
  [LEAVE_START_ANY_DAY]: 'any',
  'lunes': 'monday',
  'martes': 'tuesday',
  'miércoles': 'wednesday',
  'miercoles': 'wednesday',
  'jueves': 'thursday',
  'viernes': 'friday',
  'sábado': 'saturday',
  'sabado': 'saturday',
  'domingo': 'sunday',
};

/**
 * Normaliza el valor del backend a una clave de transloco estable.
 * Si el valor no está en el mapa (e.g. el backend cambia el string),
 * devuelve el valor crudo — transloco lo retorna tal cual al no encontrarlo como clave.
 */
export function getLeaveStartDayKey(day: string): string {
  const key = LEAVE_START_DAY_KEY_MAP[day.toLowerCase()];
  return key ? `leaves.fields.leaveStartDay.${key}` : day;
}

export function getConsecutiveDaysKey(value: boolean): string {
  return value
    ? 'leaves.fields.useConsecutiveDays.consecutiveDays'
    : 'leaves.fields.useConsecutiveDays.businessDays';
}

export function getWorkflowApproveKey(id: number): string {
  return `leaves.fields.workflowApprove.${id}`;
}

const ASSIGNMENT_DAY_KEY_MAP: Record<number, string> = {
  [AssignmentDayType.MANUAL_PER_YEAR]: 'manualPerYear',
  [AssignmentDayType.PER_YEAR]: 'perYear',
  [AssignmentDayType.PER_REQUEST]: 'perRequest',
  [AssignmentDayType.NO_LIMIT]: 'noLimit',
};

/**
 * Mapea el ID de tipo de asignación de días a una clave de transloco.
 * Si el ID no está en el mapa, devuelve el fallbackValue o string vacío.
 */
export function getAssignmentDayKey(id: number, fallbackValue?: string): string {
  const key = ASSIGNMENT_DAY_KEY_MAP[id];
  return key ? `leaves.fields.assignmentDay.${key}` : (fallbackValue ?? '');
}
