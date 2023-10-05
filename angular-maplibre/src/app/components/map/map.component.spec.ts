import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MapComponent } from './map.component';
import { MapService } from 'src/app/services/map.service';
import maplibregl from 'maplibre-gl';
import { filter, switchMap } from 'rxjs';


export const clickLngLat = (service: MapService, coords: number[]) => {
  const [lng, lat] = coords;
  const lngLat = new maplibregl.LngLat(lng, lat);
  service.mapLoaded$
    .pipe(
      filter(isLoaded => isLoaded),
      switchMap(() => service.map$)
    )
    .subscribe(map => {
      map.fire('click', { lngLat })
    });
}

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let mapService: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapComponent],
      providers: [MapService],
      imports: [
        MatCardModule
      ]
    });
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    mapService = TestBed.inject(MapService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the map', (done) => {
    mapService.map$
      .subscribe(map => {
        expect(map).toBeInstanceOf(maplibregl.Map);
        done();
      });
  });

  it('should render the map', (done) => {
    mapService.mapLoaded$
      .pipe(filter(isLoaded => isLoaded))
      .subscribe(isLoaded => {
        expect(isLoaded).toBe(true);
        done();
      });
  });

  it('should register a click on the center of the map after it is loaded', (done) => {
    const center = [0, 0];
    mapService.clickedCoordinates$
      .subscribe(lngLat => {
        expect(lngLat).toEqual(center);
        done()
      });
    clickLngLat(mapService, center);
  });
});
