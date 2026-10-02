export interface IPagedModel<T> {
   values: T[];
   page: number;
   itemPerPage: number;
   total: number;
}


export interface PaginParameter {
   page: number;
   itemPerPage: number;
}
export const ITEMSPERPAGE = 15;
