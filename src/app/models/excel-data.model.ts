export interface ExcelRow {
  [key: string]: any;
}

export interface ExcelSheet {
  name: string;
  data: ExcelRow[];
  headers: string[];
}

export interface ExcelWorkbook {
  sheets: ExcelSheet[];
  selectedSheetIndex: number;
}

export interface FilterOptions {
  searchText: string;
  columnFilters: { [column: string]: string };
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface SelectedRecord {
  data: ExcelRow;
  rowIndex: number;
  sheetName: string;
}