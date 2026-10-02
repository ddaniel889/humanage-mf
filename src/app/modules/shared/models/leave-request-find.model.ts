export class LeaveRequestFind {
    id?: string;
    filterId?: string;
    userName?: string;
    userId?: string;
    userIdFiscal?: string;
    userEmail?: string;
    legajo?: string;
    requestDate?: Date;
    expirationDate?: Date;
    startDate?: Date;
    endDate?: Date;
    fromDateCreate?: Date;
    untilDateCreate?: Date;
    fromDateStart?:Date
    untilDateStart?:Date;
    leaveTypeName?: string;
    leaveTypeId?: number;
    stateName?: string;
    stateId?: string;
    organizationalUnitId?: number;
    orderBy?: string[];
    orderAscendent?: boolean;
    isPaged?: boolean;
    itemPerPage?: number;
    page?: number;
    textSearch?: string;
    timeLineEnabled? :boolean;
    approverId?:number;
    approverAction?: number;
    approverUserdIds?:number[];
    notIncludeDraftLeaveRequests?:boolean;
    timeLineId?:number[];
    configLeaveOuId?:number;
}

export interface LeaveHolidayFind {
    id?: number;
    page:number;
    itemperpage:number;
    configLeaveOuId?: number;
    ouId?:number;
    active?:boolean;
    type?:string;
    textSearch?:string;
}
