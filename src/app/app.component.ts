import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';

// Define las interfaces aquí
interface EnvironmentConfig {
  key: string;
  value: string;
}

interface Application {
  name: string;
  environments: {
    development: EnvironmentConfig[];
    preproduction: EnvironmentConfig[];
    test: EnvironmentConfig[];
    production: EnvironmentConfig[];
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NgxPaginationModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'configuracion-app';
  applications: Application[] = [];
  excelData: any[] = []; // Variable para almacenar los datos del Excel
  filteredData: any[] = []; // Variable para almacenar los datos filtrados
  sheetNames: string[] = []; // Variable para almacenar los nombres de las hojas
  selectedSheet: string = ''; // Variable para almacenar la hoja seleccionada
  filterText: string = ''; // Variable para almacenar el texto del filtro
  workbook: XLSX.WorkBook | null = null; // Variable para almacenar el workbook

  // Método para manejar el evento de cambio de archivo
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        this.workbook = XLSX.read(data, { type: 'array' });
        this.sheetNames = this.workbook.SheetNames;
        this.selectedSheet = this.sheetNames[0];
        this.loadSheetData(this.selectedSheet);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  // Método para cargar los datos de una hoja específica
  loadSheetData(sheetName: string): void {
    if (this.workbook) {
      const worksheet = this.workbook.Sheets[sheetName];
      this.excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      this.applyFilter();
    }
  }

  // Método para cambiar la hoja seleccionada
  selectSheet(sheetName: string): void {
    this.selectedSheet = sheetName;
    this.loadSheetData(sheetName);
  }

  // Método para aplicar el filtro a los datos
  applyFilter(): void {
    if (this.filterText) {
      this.filteredData = this.excelData.filter(row =>
        row.some((cell: any) => cell.toString().toLowerCase().includes(this.filterText.toLowerCase()))
      );
    } else {
      this.filteredData = this.excelData;
    }
  }

  // Método para manejar el cambio en el texto del filtro
  onFilterTextChange(event: any): void {
    this.filterText = event.target.value;
    this.applyFilter();
  }

  // Añade el método toggleEnv aquí
  toggleEnv(appName: string, env: string): void {
    const app = this.applications.find(application => application.name === appName);
    if (app) {
      const envConfig = app.environments[env as keyof typeof app.environments];
      if (envConfig) {
        envConfig.forEach(config => {
          config.value = config.value === 'visible' ? 'hidden' : 'visible';
        });
      }
    }
  }

  isEnvVisible(appName: string, env: string): boolean {
    const app = this.applications.find(application => application.name === appName);
    if (app) {
      const envConfig = app.environments[env as keyof typeof app.environments];
      if (envConfig) {
        return envConfig.some(config => config.value === 'visible');
      }
    }
    return false;
  }

  itemsPerPage = 10;
  currentPage = 1;

  pageChanged(event: number) {
    this.currentPage = event;
  }
}
