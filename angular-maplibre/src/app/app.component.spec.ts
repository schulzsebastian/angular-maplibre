import { TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppComponent } from 'src/app/app.component';
import { PanelComponent } from 'src/app/components/panel/panel.component';
import { MapComponent } from 'src/app/components/map/map.component';
import { AppService } from './services/app.service';
import { MapService } from './services/map.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [
      AppComponent,
      PanelComponent,
      MapComponent
    ],
    providers: [
      AppService,
      MapService,
      { provide: Window, useValue: window }],
    imports: [
      FlexLayoutModule,
      MatToolbarModule,
      MatCardModule,
      MatIconModule
    ]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-toolbar')?.textContent).toContain('Angular Maplibre');
  });
});
