export class LeaveTimeLine {
    id?: string;
    configLeaveOuId?: string;
    dateFrom?: string;
    dateTo?: string;
    enabled?: boolean;
    description?: string;
    periodo?:string;
    name?:string;
}

export interface LeaveTimeLineFind {
  id?: string;
  configLeaveOuId?: string;
  dateFrom?: string;
  dateTo?: string;
  enabled?: boolean;
  description?: string;
  periodo?:string;
  name?:string;
  selected:boolean;
}
