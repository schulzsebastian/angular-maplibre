import { Injectable } from '@angular/core';
import { fromEvent, Observable, of } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(
    private window: Window
  ) { }

  window$: Observable<Window> = fromEvent(this.window, 'resize').pipe(
    startWith(this.window),
    switchMap(() => {
      return of(this.window);
    })
  );
}
