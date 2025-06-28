import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="file-upload-container">
      <div class="upload-area" 
           [class.dragover]="isDragOver()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           (click)="fileInput.click()">
        
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <h3>Cargar archivo Excel</h3>
        <p>Arrastra y suelta tu archivo aquí o haz clic para seleccionar</p>
        <p class="file-types">Formatos soportados: .xlsx, .xls, .csv</p>
        
        <input #fileInput
               type="file"
               accept=".xlsx,.xls,.csv"
               (change)="onFileSelected($event)"
               style="display: none;">
      </div>
      
      @if (isUploading()) {
        <div class="upload-progress">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p>Procesando archivo...</p>
        </div>
      }
      
      @if (uploadError()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ uploadError() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .file-upload-container {
      padding: 2rem;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #fafafa;
    }

    .upload-area:hover,
    .upload-area.dragover {
      border-color: #2196f3;
      background-color: #e3f2fd;
    }

    .upload-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      color: #666;
      margin-bottom: 1rem;
    }

    .upload-area h3 {
      margin: 1rem 0;
      color: #333;
    }

    .upload-area p {
      color: #666;
      margin: 0.5rem 0;
    }

    .file-types {
      font-size: 0.875rem;
      font-style: italic;
    }

    .upload-progress {
      margin-top: 1rem;
      text-align: center;
    }

    .upload-progress p {
      margin-top: 0.5rem;
      color: #666;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 1rem;
      background-color: #ffebee;
      border-radius: 4px;
      color: #c62828;
    }
  `]
})
export class FileUploadComponent {
  fileSelected = output<File>();
  
  isDragOver = signal(false);
  isUploading = signal(false);
  uploadError = signal<string | null>(null);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.uploadError.set(null);
    
    if (!this.isValidFileType(file)) {
      this.uploadError.set('Tipo de archivo no válido. Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.uploadError.set('El archivo es demasiado grande. El tamaño máximo es 10MB.');
      return;
    }

    this.isUploading.set(true);
    
    // Simulate processing delay
    setTimeout(() => {
      this.isUploading.set(false);
      this.fileSelected.emit(file);
    }, 500);
  }

  private isValidFileType(file: File): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    return validTypes.includes(file.type) || 
           file.name.match(/\.(xlsx|xls|csv)$/i) !== null;
  }
}