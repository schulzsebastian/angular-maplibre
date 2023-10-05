import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import maplibregl from 'maplibre-gl';
import { MaplibreConfig } from '../types/map.types';


@Injectable()
export class MapService {
  constructor(
  ) { }

  public map$: Subject<maplibregl.Map> = new ReplaySubject();
  public mapLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public clickedCoordinates$: Subject<[number, number]> = new Subject();

  public initMap(target: HTMLElement): void {
    const config: MaplibreConfig = {
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
      center: [0, 0],
      zoom: 0
    };
    const map = new maplibregl.Map({
      container: target,
      style: config.style,
      center: config.center,
      zoom: config.zoom,
      maxZoom: 20
    });
    map.on('load', () => {
      this.mapLoaded$.next(true);
    });
    map.on('click', (e) => {
      this.clickedCoordinates$.next([e.lngLat.lat, e.lngLat.lng])
    });
    this.map$.next(map);
  }
}