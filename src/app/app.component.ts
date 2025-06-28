import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ExcelService } from './services/excel.service';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { SheetSelectorComponent } from './components/sheet-selector/sheet-selector.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { RecordDetailsComponent } from './components/record-details/record-details.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatSnackBarModule,
    FileUploadComponent,
    SheetSelectorComponent,
    DataTableComponent,
    RecordDetailsComponent
  ],
  template: `
    <div class="app-container">
      <!-- Header -->
      <mat-toolbar color="primary" class="app-header">
        <mat-icon>table_chart</mat-icon>
        <span>{{ title }}</span>
        
        <span class="spacer"></span>
        
        @if (excelService.workbook()) {
          <button mat-icon-button (click)="resetApp()" matTooltip="Cargar nuevo archivo">
            <mat-icon>refresh</mat-icon>
          </button>
        }
      </mat-toolbar>

      <!-- Main Content -->
      <div class="app-content">
        @if (!excelService.workbook()) {
          <!-- File Upload Section -->
          <div class="upload-section">
            <app-file-upload (fileSelected)="onFileSelected($event)"></app-file-upload>
          </div>
        } @else {
          <!-- Data Management Section -->
          <mat-sidenav-container class="data-container">
            <!-- Main Data View -->
            <mat-sidenav-content class="main-content">
              <!-- Sheet Selector -->
              <app-sheet-selector
                [sheets]="excelService.workbook()!.sheets"
                [selectedIndex]="excelService.workbook()!.selectedSheetIndex"
                (sheetChanged)="onSheetChanged($event)">
              </app-sheet-selector>

              <!-- Data Table -->
              @if (excelService.currentSheet()) {
                <app-data-table
                  [data]="excelService.filteredData()"
                  [headers]="excelService.currentSheet()!.headers"
                  [selectedRecord]="excelService.selectedRecord()?.data || null"
                  (recordSelected)="onRecordSelected($event)"
                  (exportData)="onExportData()">
                </app-data-table>
              }
            </mat-sidenav-content>

            <!-- Side Panel for Record Details -->
            <mat-sidenav 
              mode="side" 
              position="end" 
              [opened]="sidenavOpen()"
              class="record-sidenav">
              <div class="sidenav-header">
                <h3>Detalles del Registro</h3>
                <button mat-icon-button (click)="toggleSidenav()">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              
              <div class="sidenav-content">
                <app-record-details [record]="excelService.selectedRecord()">
                </app-record-details>
              </div>
            </mat-sidenav>
          </mat-sidenav-container>
        }
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-header mat-icon {
      margin-right: 0.5rem;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .app-content {
      flex: 1;
      overflow: hidden;
    }

    .upload-section {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fafafa;
    }

    .data-container {
      height: 100%;
    }

    .main-content {
      padding: 1rem;
      overflow: auto;
    }

    .record-sidenav {
      width: 400px;
      border-left: 1px solid #e0e0e0;
    }

    .sidenav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;
      background-color: #f5f5f5;
    }

    .sidenav-header h3 {
      margin: 0;
      color: #333;
    }

    .sidenav-content {
      padding: 1rem;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .record-sidenav {
        width: 100%;
      }
      
      .main-content {
        padding: 0.5rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'Configuración App - Excel Viewer';
  
  excelService = inject(ExcelService);
  snackBar = inject(MatSnackBar);
  
  sidenavOpen = signal(false);
  isLoading = signal(false);

  async onFileSelected(file: File): Promise<void> {
    this.isLoading.set(true);
    
    try {
      await this.excelService.loadExcelFile(file);
      this.snackBar.open('Archivo cargado exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } catch (error) {
      console.error('Error loading file:', error);
      this.snackBar.open('Error al cargar el archivo', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  onSheetChanged(index: number): void {
    this.excelService.selectSheet(index);
    this.sidenavOpen.set(false); // Close sidenav when changing sheets
  }

  onRecordSelected(event: { data: any; index: number }): void {
    this.excelService.selectRecord(event.data, event.index);
    this.sidenavOpen.set(true);
  }

  onExportData(): void {
    try {
      this.excelService.exportFilteredData('xlsx');
      this.snackBar.open('Datos exportados exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      this.snackBar.open('Error al exportar los datos', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  toggleSidenav(): void {
    this.sidenavOpen.set(!this.sidenavOpen());
  }

  resetApp(): void {
    this.excelService.workbook.set(null);
    this.excelService.selectedRecord.set(null);
    this.sidenavOpen.set(false);
    
    this.snackBar.open('Aplicación reiniciada', 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}