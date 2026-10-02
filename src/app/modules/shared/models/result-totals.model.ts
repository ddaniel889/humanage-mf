export interface ResultTotals {
  id: string;
  processId: string;
  totalItems: number;
  okTotalItemsw: number;
  errorTotalItems: number;
  horaInicio: Date;
  horaUltimoRegistro: Date;
  horaFin: Date;
  totalArchivosProcesados: number;
  advancePercentage?: number;
  pagesProcessed?: number;
  totalPages?: number;
}
