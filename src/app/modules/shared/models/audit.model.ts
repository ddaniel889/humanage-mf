import { PaginParameter } from "./paged.model.";

export interface Audit {
    id: string;
    entity: string;
    organizationalUnitId: string;
    organizationalUnitName: string;
    userId: number;
    userName: string;
    applicationId: string;
    applicationName: string;
    creationDate: Date;
    actionType: any;
    entityName: string;
    entityid: number;
    keys: any;
}


export interface AuditParameters extends PaginParameter{
    organizationalUnitId?: number;
    userName?: string;
    dateFrom?: any;
    dateTo?: any;
    actionType?: number;
}


export interface ActionTypes {
    id: number;
    idAplicacion: number;
    description: string;
    traslatedName: string;
    name: string;
}
