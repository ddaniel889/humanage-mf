import { ResultTotals } from './result-totals.model';
export interface ProcesResultTotals {
  id: string;
  name: string;
  organizationalUnitId: string;
  organizationalUnitName: string;
  processTypeId: string;
  processTypeName: string;
  workFlowId: string;
  stateId: string;
  stateName: string;
  stateAlias: string;
  stateEdit: boolean;
  stateFinish: boolean;
  stateChange: boolean;
  stateDate?: Date;
  userStep: string;
  metadataValues: any[];
  creationDate: Date;
  checketOutBy?: number;
  checkedOutByName: string;
  files: any[];
  from: string;
  owner: number;
  deferedProcessId: string;
  filesCount: number;
  filesSize: number;
  results: ResultTotals;
}
