// app-configuracion.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-configuracion',
  templateUrl: './app-configuracion.component.html',
  styleUrls: ['./app-configuracion.component.css']
})
export class AppConfiguracionComponent {
  app = {
    value: [
      ['ID', 'Nombre', 'Descripción', 'Dirección'],
      [1, 'Centro 1', 'Descripción 1', 'Dirección 1'],
      [2, 'Centro 2', 'Descripción 2', 'Dirección 2'],
      [3, 'Centro 3', 'Descripción 3', 'Dirección 3']
    ]
  };

  registroSeleccionado: any;

  selectRow(row: any) {
    this.registroSeleccionado = row;
    console.log('Registro seleccionado:', row);
  }

  buscarEnGoogleMaps(row: any) {
    const direccion = row[3]; // Suponiendo que la dirección está en la cuarta columna
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    window.open(url, '_blank');
  }
}
