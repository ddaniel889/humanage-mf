export interface LeaveState {
  key: string;
  name: string;
  stateDate: Date;
  isFinishState: boolean;
  userId: number;
  note: string;
  userName: string;
}

export enum LeaveStateFind {
  borrador = 0,
  pendiente = 1,
  aprobado = 2,
  rechazado = 3,
  cancelado = 4,
  paraAprobar = 5
}

