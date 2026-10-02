/**
 * IDs de tipos de licencia del sistema.
 */
export const LeaveTypeId = {
  VACATION: 1, // Licencia por vacaciones
  SICK: 2, // Licencia por enfermedad
  MATERNITY: 3, // Licencia por maternidad
  STUDY: 4, // Licencia por estudio
  PATERNITY: 5, // Licencia por paternidad
  ACCIDENT: 6, // Licencia por accidente
  PREVENTIVE_EXAMS: 7, // Licencia por exámenes preventivos
  FAMILY_DEATH: 8, // Licencia por fallecimiento de familiar
  MARRIAGE: 9, // Licencia por matrimonio
  MOVE: 10, // Licencia por mudanza
  BLOOD_DONATION: 11, // Licencia por donación de sangre
} as const;

export interface LeaveType {
  id: number;
  description: string;
  isAccumulateDays?: boolean;
}

const DEFAULT_LEAVE_TYPE_ICON = 'fa-calendar-alt';

const LEAVE_TYPE_ICON_MAP: Record<number, string> = {//
  [LeaveTypeId.VACATION]: 'fa-umbrella-beach',
  [LeaveTypeId.SICK]: 'fa-briefcase-medical',
  [LeaveTypeId.MATERNITY]: 'fa-baby-carriage',
  [LeaveTypeId.STUDY]: 'fa-book',
  [LeaveTypeId.PATERNITY]: 'fa-baby-carriage',
  [LeaveTypeId.ACCIDENT]: 'fa-user-injured',
  [LeaveTypeId.PREVENTIVE_EXAMS]: 'fa-stethoscope',
  [LeaveTypeId.FAMILY_DEATH]: 'fa-ribbon',
  [LeaveTypeId.MARRIAGE]: 'fa-ring-diamond',
  [LeaveTypeId.MOVE]: 'fa-house-chimney',
  [LeaveTypeId.BLOOD_DONATION]: 'fa-droplet',
};

const LEAVE_TYPE_KEY_MAP: Record<number, string> = {
  [LeaveTypeId.VACATION]: 'vacation',
  [LeaveTypeId.SICK]: 'sick',
  [LeaveTypeId.MATERNITY]: 'maternity',
  [LeaveTypeId.STUDY]: 'study',
  [LeaveTypeId.PATERNITY]: 'paternity',
  [LeaveTypeId.ACCIDENT]: 'accident',
  [LeaveTypeId.PREVENTIVE_EXAMS]: 'preventiveExams',
  [LeaveTypeId.FAMILY_DEATH]: 'familyDeath',
  [LeaveTypeId.MARRIAGE]: 'marriage',
  [LeaveTypeId.MOVE]: 'move',
  [LeaveTypeId.BLOOD_DONATION]: 'bloodDonation',
};

function normalizeLeaveTypeId(leaveTypeId: number): number {
  // Legacy backend records can arrive with 0 for vacation leaves.
  return leaveTypeId === 0 ? LeaveTypeId.VACATION : leaveTypeId;
}

export function isVacationLeaveType(leaveTypeId: number): boolean {
  return normalizeLeaveTypeId(leaveTypeId) === LeaveTypeId.VACATION;
}

export function getLeaveTypeIcon(leaveTypeId: number, fallbackIcon = DEFAULT_LEAVE_TYPE_ICON): string {
  return LEAVE_TYPE_ICON_MAP[normalizeLeaveTypeId(leaveTypeId)] ?? fallbackIcon;
}

export function getLeaveTypeKey(leaveTypeId: number, fallbackValue = ''): string {
  const key = LEAVE_TYPE_KEY_MAP[normalizeLeaveTypeId(leaveTypeId)];
  return key ? `leaves.fields.leaveType.${key}` : fallbackValue;
}
