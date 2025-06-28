import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { SelectedRecord } from '../../models/excel-data.model';

@Component({
  selector: 'app-record-details',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDividerModule
  ],
  template: `
    @if (record()) {
      <mat-card class="record-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>info</mat-icon>
            Registro Seleccionado
          </mat-card-title>
          <mat-card-subtitle>
            Fila {{ record()!.rowIndex + 1 }} de {{ record()!.sheetName }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="record-details">
            @for (item of getRecordEntries(); track item.key) {
              <div class="detail-item">
                <div class="detail-label">{{ item.key }}:</div>
                <div class="detail-value">{{ item.value || 'N/A' }}</div>
              </div>
              @if (!$last) {
                <mat-divider></mat-divider>
              }
            }
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="copyToClipboard()">
            <mat-icon>content_copy</mat-icon>
            Copiar datos
          </button>
          
          @if (hasAddressField()) {
            <button mat-raised-button color="accent" (click)="openInMaps()">
              <mat-icon>map</mat-icon>
              Ver en Maps
            </button>
          }
        </mat-card-actions>
      </mat-card>
    } @else {
      <mat-card class="no-selection">
        <mat-card-content>
          <div class="no-selection-content">
            <mat-icon>touch_app</mat-icon>
            <h3>Selecciona un registro</h3>
            <p>Haz clic en cualquier fila de la tabla para ver sus detalles aquí.</p>
          </div>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .record-card {
      margin: 1rem 0;
      max-width: 600px;
    }

    .record-details {
      max-height: 400px;
      overflow-y: auto;
    }

    .detail-item {
      padding: 0.75rem 0;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 1rem;
      align-items: start;
    }

    .detail-label {
      font-weight: 500;
      color: #666;
      word-break: break-word;
    }

    .detail-value {
      word-break: break-word;
      color: #333;
    }

    .no-selection {
      margin: 1rem 0;
    }

    .no-selection-content {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .no-selection-content mat-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      margin-bottom: 1rem;
    }

    .no-selection-content h3 {
      margin: 1rem 0 0.5rem 0;
    }

    .no-selection-content p {
      margin: 0;
    }

    mat-card-header mat-icon {
      margin-right: 0.5rem;
    }

    mat-card-actions {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class RecordDetailsComponent {
  record = input<SelectedRecord | null>(null);

  getRecordEntries(): { key: string; value: any }[] {
    const recordData = this.record();
    if (!recordData) return [];
    
    return Object.entries(recordData.data).map(([key, value]) => ({
      key,
      value
    }));
  }

  hasAddressField(): boolean {
    const recordData = this.record();
    if (!recordData) return false;
    
    return Object.keys(recordData.data).some(key =>
      key.toLowerCase().includes('dirección') ||
      key.toLowerCase().includes('direccion') ||
      key.toLowerCase().includes('address')
    );
  }

  async copyToClipboard(): Promise<void> {
    const recordData = this.record();
    if (!recordData) return;

    const text = Object.entries(recordData.data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      // You could add a snackbar notification here
      console.log('Datos copiados al portapapeles');
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  }

  openInMaps(): void {
    const recordData = this.record();
    if (!recordData) return;

    const addressKey = Object.keys(recordData.data).find(key =>
      key.toLowerCase().includes('dirección') ||
      key.toLowerCase().includes('direccion') ||
      key.toLowerCase().includes('address')
    );

    if (addressKey && recordData.data[addressKey]) {
      const address = encodeURIComponent(String(recordData.data[addressKey]));
      const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
      window.open(url, '_blank');
    }
  }
}