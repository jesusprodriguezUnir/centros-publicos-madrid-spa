import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ExcelRow } from '../../models/excel-data.model';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  template: `
    <div class="table-container">
      <!-- Search and Filter Controls -->
      <div class="table-controls">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar en todos los campos</mat-label>
          <input matInput 
                 [value]="searchText()"
                 (input)="onSearchChange($event)"
                 placeholder="Escribe para buscar...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <div class="action-buttons">
          <button mat-raised-button 
                  color="primary"
                  (click)="exportData.emit()"
                  [disabled]="!data().length">
            <mat-icon>download</mat-icon>
            Exportar
          </button>
          
          <button mat-icon-button [matMenuTriggerFor]="columnMenu">
            <mat-icon>view_column</mat-icon>
          </button>
        </div>
      </div>

      <!-- Column Visibility Menu -->
      <mat-menu #columnMenu="matMenu">
        <div class="column-menu">
          <h4>Mostrar/Ocultar Columnas</h4>
          @for (column of headers(); track column) {
            <mat-checkbox 
              [checked]="visibleColumns().includes(column)"
              (change)="toggleColumn(column)">
              {{ column }}
            </mat-checkbox>
          }
        </div>
      </mat-menu>

      <!-- Column Filters -->
      @if (showColumnFilters()) {
        <div class="column-filters">
          @for (column of visibleColumns(); track column) {
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filtrar {{ column }}</mat-label>
              <input matInput 
                     [value]="columnFilters()[column] || ''"
                     (input)="onColumnFilterChange(column, $event)">
            </mat-form-field>
          }
        </div>
      }

      <!-- Data Table -->
      <div class="table-wrapper">
        <table mat-table [dataSource]="paginatedData()" class="data-table">
          @for (column of visibleColumns(); track column) {
            <ng-container [matColumnDef]="column">
              <th mat-header-cell *matHeaderCellDef>
                {{ column }}
                <button mat-icon-button 
                        class="filter-toggle"
                        (click)="toggleColumnFilters()">
                  <mat-icon>filter_list</mat-icon>
                </button>
              </th>
              <td mat-cell *matCellDef="let row">
                {{ getCellValue(row, column) }}
              </td>
            </ng-container>
          }

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let row; let i = index">
              <button mat-icon-button 
                      color="primary"
                      (click)="selectRow(row, i)"
                      matTooltip="Seleccionar registro">
                <mat-icon>check_circle</mat-icon>
              </button>
              
              @if (hasAddressColumn()) {
                <button mat-icon-button 
                        color="accent"
                        (click)="openInMaps(row)"
                        matTooltip="Abrir en Google Maps">
                  <mat-icon>map</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
          <tr mat-row 
              *matRowDef="let row; columns: displayedColumns()"
              [class.selected-row]="isRowSelected(row)"
              (click)="selectRow(row, getRowIndex(row))"></tr>
        </table>
      </div>

      <!-- Pagination -->
      <mat-paginator 
        [length]="filteredData().length"
        [pageSize]="pageSize()"
        [pageSizeOptions]="[5, 10, 25, 50, 100]"
        [pageIndex]="currentPage()"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>

      <!-- No Data Message -->
      @if (!data().length) {
        <div class="no-data">
          <mat-icon>inbox</mat-icon>
          <p>No hay datos para mostrar</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .table-container {
      padding: 1rem;
    }

    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .column-filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .filter-field {
      width: 100%;
    }

    .table-wrapper {
      overflow-x: auto;
      margin-bottom: 1rem;
    }

    .data-table {
      width: 100%;
      min-width: 600px;
    }

    .filter-toggle {
      opacity: 0.6;
      transition: opacity 0.3s;
    }

    .filter-toggle:hover {
      opacity: 1;
    }

    .selected-row {
      background-color: #e3f2fd !important;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      margin-bottom: 1rem;
    }

    .column-menu {
      padding: 1rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .column-menu h4 {
      margin: 0 0 1rem 0;
    }

    .column-menu mat-checkbox {
      display: block;
      margin-bottom: 0.5rem;
    }

    mat-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    mat-row:hover {
      background-color: #f5f5f5;
    }
  `]
})
export class DataTableComponent {
  // Inputs
  data = input<ExcelRow[]>([]);
  headers = input<string[]>([]);
  selectedRecord = input<ExcelRow | null>(null);

  // Outputs
  recordSelected = output<{ data: ExcelRow; index: number }>();
  exportData = output<void>();

  // Internal state
  searchText = signal('');
  columnFilters = signal<{ [key: string]: string }>({});
  visibleColumns = signal<string[]>([]);
  showColumnFilters = signal(false);
  currentPage = signal(0);
  pageSize = signal(10);

  // Computed values
  filteredData = computed(() => {
    let filtered = this.data();
    const search = this.searchText().toLowerCase();
    const filters = this.columnFilters();

    // Apply global search
    if (search) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(search)
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row =>
          String(row[column]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    return filtered;
  });

  paginatedData = computed(() => {
    const filtered = this.filteredData();
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  displayedColumns = computed(() => {
    return [...this.visibleColumns(), 'actions'];
  });

  hasAddressColumn = computed(() => {
    const headers = this.headers();
    return headers.some(header => 
      header.toLowerCase().includes('dirección') ||
      header.toLowerCase().includes('direccion') ||
      header.toLowerCase().includes('address')
    );
  });

  constructor() {
    // Initialize visible columns when headers change
    this.headers.subscribe(headers => {
      if (headers.length > 0) {
        this.visibleColumns.set([...headers]);
      }
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchText.set(target.value);
    this.currentPage.set(0); // Reset to first page
  }

  onColumnFilterChange(column: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const filters = { ...this.columnFilters() };
    
    if (target.value) {
      filters[column] = target.value;
    } else {
      delete filters[column];
    }
    
    this.columnFilters.set(filters);
    this.currentPage.set(0); // Reset to first page
  }

  toggleColumn(column: string): void {
    const visible = this.visibleColumns();
    if (visible.includes(column)) {
      this.visibleColumns.set(visible.filter(col => col !== column));
    } else {
      this.visibleColumns.set([...visible, column]);
    }
  }

  toggleColumnFilters(): void {
    this.showColumnFilters.set(!this.showColumnFilters());
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  selectRow(row: ExcelRow, index: number): void {
    this.recordSelected.emit({ data: row, index });
  }

  isRowSelected(row: ExcelRow): boolean {
    const selected = this.selectedRecord();
    return selected ? JSON.stringify(selected) === JSON.stringify(row) : false;
  }

  getRowIndex(row: ExcelRow): number {
    return this.filteredData().indexOf(row);
  }

  getCellValue(row: ExcelRow, column: string): any {
    return row[column] || '';
  }

  openInMaps(row: ExcelRow): void {
    const headers = this.headers();
    const addressColumn = headers.find(header => 
      header.toLowerCase().includes('dirección') ||
      header.toLowerCase().includes('direccion') ||
      header.toLowerCase().includes('address')
    );

    if (addressColumn && row[addressColumn]) {
      const address = encodeURIComponent(String(row[addressColumn]));
      const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
      window.open(url, '_blank');
    }
  }
}