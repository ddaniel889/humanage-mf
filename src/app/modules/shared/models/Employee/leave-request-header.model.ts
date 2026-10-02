import { Approver } from "./approver.model";

export class LeaveRequestHeaders {
  id: string;
  userName: string;
  userIdFiscal: string;
  requestDate: Date;
  expirationDate: Date;
  startDate: Date;
  endDate: Date;
  leaveTypeName: string | null;
  leaveTypeId: number;
  stateName: string;
  stateId: string;
  daysConsumed: number;
  note: string;
  createdBy: Approver;
}
