export interface LeaveRequestsFrom {
  StartDate: Date;
  EndDate: Date;
  DaysConsumed: number;
  ConfigTimesLinesId: string[];
  ConfigAproversId: number[];
  userEmail?: string;
  userId?: number;
  nroLegajo?: string;
  userIdFiscal?: number;
  firstName?: string;
  lastName?: string;
  leaveTypeOuId?: number;
}
