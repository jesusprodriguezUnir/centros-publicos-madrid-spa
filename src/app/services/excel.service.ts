import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { ExcelWorkbook, ExcelSheet, FilterOptions, SelectedRecord } from '../models/excel-data.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  private workbookSubject = new BehaviorSubject<ExcelWorkbook | null>(null);
  private selectedRecordSubject = new BehaviorSubject<SelectedRecord | null>(null);
  private filterOptionsSubject = new BehaviorSubject<FilterOptions>({
    searchText: '',
    columnFilters: {}
  });

  // Signals for reactive state management
  workbook = signal<ExcelWorkbook | null>(null);
  selectedRecord = signal<SelectedRecord | null>(null);
  filterOptions = signal<FilterOptions>({
    searchText: '',
    columnFilters: {}
  });

  // Computed values
  currentSheet = computed(() => {
    const wb = this.workbook();
    return wb ? wb.sheets[wb.selectedSheetIndex] : null;
  });

  filteredData = computed(() => {
    const sheet = this.currentSheet();
    const filters = this.filterOptions();
    
    if (!sheet) return [];
    
    return this.applyFilters(sheet.data, filters);
  });

  // Observables for backward compatibility
  workbook$ = this.workbookSubject.asObservable();
  selectedRecord$ = this.selectedRecordSubject.asObservable();
  filterOptions$ = this.filterOptionsSubject.asObservable();

  async loadExcelFile(file: File): Promise<void> {
    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const sheets: ExcelSheet[] = workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        const headers = jsonData[0] || [];
        const data = jsonData.slice(1).map(row => {
          const rowObj: any = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index] || '';
          });
          return rowObj;
        });

        return {
          name: sheetName,
          data,
          headers
        };
      });

      const excelWorkbook: ExcelWorkbook = {
        sheets,
        selectedSheetIndex: 0
      };

      this.workbook.set(excelWorkbook);
      this.workbookSubject.next(excelWorkbook);
    } catch (error) {
      console.error('Error loading Excel file:', error);
      throw new Error('Failed to load Excel file');
    }
  }

  selectSheet(index: number): void {
    const wb = this.workbook();
    if (wb && index >= 0 && index < wb.sheets.length) {
      const updatedWorkbook = { ...wb, selectedSheetIndex: index };
      this.workbook.set(updatedWorkbook);
      this.workbookSubject.next(updatedWorkbook);
    }
  }

  selectRecord(data: any, rowIndex: number): void {
    const sheet = this.currentSheet();
    if (sheet) {
      const record: SelectedRecord = {
        data,
        rowIndex,
        sheetName: sheet.name
      };
      this.selectedRecord.set(record);
      this.selectedRecordSubject.next(record);
    }
  }

  updateFilter(filters: Partial<FilterOptions>): void {
    const currentFilters = this.filterOptions();
    const updatedFilters = { ...currentFilters, ...filters };
    this.filterOptions.set(updatedFilters);
    this.filterOptionsSubject.next(updatedFilters);
  }

  exportFilteredData(format: 'xlsx' | 'csv' = 'xlsx'): void {
    const filteredData = this.filteredData();
    const sheet = this.currentSheet();
    
    if (!sheet || filteredData.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered Data');

    const fileName = `filtered_data.${format}`;
    XLSX.writeFile(wb, fileName);
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private applyFilters(data: any[], filters: FilterOptions): any[] {
    let filtered = [...data];

    // Apply search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply column-specific filters
    Object.entries(filters.columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        const filterLower = filterValue.toLowerCase();
        filtered = filtered.filter(row =>
          String(row[column]).toLowerCase().includes(filterLower)
        );
      }
    });

    return filtered;
  }
}