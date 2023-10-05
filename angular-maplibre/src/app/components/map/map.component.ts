import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  constructor(
    private mapService: MapService
  ) { }

  ngOnInit(): void {
    this.mapService.initMap(
      this.mapElement.nativeElement
    );
  }
}