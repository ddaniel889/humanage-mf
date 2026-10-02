import { MatPaginatorIntl } from '@angular/material/paginator';

const esRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length === 0 || pageSize === 0) {
    return `0 de ${length}`;
  }

  length = Math.max(length, 0);
  const maxPages = Math.ceil(length / pageSize);

  return `${page + 1} de ${maxPages}`;
};

export function getEsPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Cantidad por página:';
  paginatorIntl.nextPageLabel = 'Próxima página ';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.getRangeLabel = esRangeLabel;
  paginatorIntl.lastPageLabel = 'Última página';
  paginatorIntl.firstPageLabel = 'Primera página';
  return paginatorIntl;
}
