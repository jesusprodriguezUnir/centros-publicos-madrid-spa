import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppConfiguracionComponent } from './app-configuracion.component';

describe('AppConfiguracionComponent', () => {
  let component: AppConfiguracionComponent;
  let fixture: ComponentFixture<AppConfiguracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppConfiguracionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
