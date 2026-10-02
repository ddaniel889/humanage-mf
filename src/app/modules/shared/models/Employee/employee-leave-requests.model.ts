import { ConfigLeaveEmployee } from "./config-leave-employee.model";
import { ConfigLeaveOu } from "./config-leave-ou.model";
import { LeaveState } from "./leave-state.model";

export class EmployeeLeaveRequests {
  id: string;
  userId: number;
  userName: string;
  userIdFiscal: string;
  userEmail: string;
  userTelephone: string;
  legajo: string;
  organizationalUnitId: number;
  requestDate: Date;
  expirationDate: Date;
  startDate: Date;
  endDate: Date;
  note: string;
  configLeaveEmployee: ConfigLeaveEmployee;
  configLeaveOu: ConfigLeaveOu;
  state: LeaveState;
  stateHistory: LeaveState[];
}
