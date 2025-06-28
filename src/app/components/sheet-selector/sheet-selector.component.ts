import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { ExcelSheet } from '../../models/excel-data.model';

@Component({
  selector: 'app-sheet-selector',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatBadgeModule],
  template: `
    <mat-tab-group 
      [selectedIndex]="selectedIndex()"
      (selectedIndexChange)="onSheetChange($event)"
      class="sheet-tabs">
      
      @for (sheet of sheets(); track sheet.name; let i = $index) {
        <mat-tab>
          <ng-template mat-tab-label>
            <span [matBadge]="sheet.data.length" 
                  matBadgePosition="after" 
                  matBadgeSize="small"
                  [matBadgeHidden]="sheet.data.length === 0">
              {{ sheet.name }}
            </span>
          </ng-template>
          
          <div class="sheet-info">
            <h3>{{ sheet.name }}</h3>
            <p>{{ sheet.data.length }} registros</p>
            <p>{{ sheet.headers.length }} columnas</p>
          </div>
        </mat-tab>
      }
    </mat-tab-group>
  `,
  styles: [`
    .sheet-tabs {
      margin-bottom: 1rem;
    }

    .sheet-info {
      padding: 1rem;
      text-align: center;
      color: #666;
    }

    .sheet-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .sheet-info p {
      margin: 0.25rem 0;
      font-size: 0.875rem;
    }

    ::ng-deep .mat-mdc-tab-label {
      min-width: 120px !important;
    }
  `]
})
export class SheetSelectorComponent {
  sheets = input<ExcelSheet[]>([]);
  selectedIndex = input<number>(0);
  
  sheetChanged = output<number>();

  onSheetChange(index: number): void {
    this.sheetChanged.emit(index);
  }
}