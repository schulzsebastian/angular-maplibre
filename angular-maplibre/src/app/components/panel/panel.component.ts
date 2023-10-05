import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, map, startWith } from 'rxjs';
import { MapService } from 'src/app/services/map.service';


@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelComponent {
  constructor(
    private mapService: MapService
  ) { }

  vm$ = combineLatest([
    this.mapService.clickedCoordinates$.pipe(
      startWith([null, null])
    )
  ]).pipe(
    map(([clickedCoordinates]) => {
      return ({ clickedCoordinates });
    })
  );
}
