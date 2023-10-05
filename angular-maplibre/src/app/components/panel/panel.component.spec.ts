import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { PanelComponent } from 'src/app/components/panel/panel.component';
import { MapService } from 'src/app/services/map.service';

describe('PanelComponent', () => {
  let component: PanelComponent;
  let fixture: ComponentFixture<PanelComponent>;
  let mapService: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PanelComponent],
      imports: [
        MatCardModule,
        MatIconModule
      ],
      providers: [
        MapService
      ],
    })
    fixture = TestBed.createComponent(PanelComponent);
    component = fixture.componentInstance;
    mapService = TestBed.inject(MapService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display placeholders', () => {
    const compiled = fixture.nativeElement;
    const coordXText = compiled.querySelector('div.easy-font:nth-child(1) div:nth-child(2)').textContent;
    const coordYText = compiled.querySelector('div.easy-font:nth-child(2) div:nth-child(2)').textContent;
    expect(coordXText).toContain('Coordinate X: ');
    expect(coordYText).toContain('Coordinate Y: ');
  });

  it('should display coordinates', done => {
    const center: [number, number] = [0, 0];
    mapService.clickedCoordinates$
      .subscribe(() => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const coordXText = compiled.querySelector('div.easy-font:nth-child(1) div:nth-child(2)').textContent;
        const coordYText = compiled.querySelector('div.easy-font:nth-child(2) div:nth-child(2)').textContent;
        expect(coordXText).toContain('Coordinate X: 0');
        expect(coordYText).toContain('Coordinate Y: 0');
        done()
      });
    mapService.clickedCoordinates$.next(center)
  });
});
