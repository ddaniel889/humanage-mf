import { AdditionalDays } from "./Employee/additional-type.model";
import { LeaveApprovers } from "./approvers.model";
import { LeaveType } from "./Employee/leave-type.model";
import { LeaveTimeLine } from "./times-lines.model";

export interface ConfigLeaveEmployeeParams {
    id?: number;
    userId: number;
    configLeaveOuId?: number;
    leaveType?: LeaveType;
    baseDays: number;
    additionalDays?: AdditionalDays[];
    configTimesLines?: LeaveTimeLine[];
    configApprovers?: LeaveApprovers[];
}
