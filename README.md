# Unit testing WebGIS in Angular

tags: Maplibre GL, Angular, Karma, Jasmine, Docker

tl;dr Test behavior, not libs

GIS technologies are a pivotal element in modern web applications, enabling interactive visualization and analysis of spatial data. In the Angular environment, libraries such as MapLibre GL are invaluable for creating rich, interactive maps. However, like any other component in an application, map components too need to undergo rigorous testing to ensure their reliability and accuracy.

In this article, we will focus on exploring the basic steps necessary to get MapLibre up and running in an Angular project, and then on crafting a simple suite of tests using the popular testing tools Karma and Jasmine. Our aim will be to provide a solid understanding of how to initiate the testing environment, prepare the map component for testing, and how to organize fundamental unit and integration tests that will check the key functionalities of our map component.

These steps lay the foundation for anyone looking to build confidence that their GIS applications are performing as expected, regardless of the project’s complexity. Through the exploration of these basic techniques, you will be able to build a solid groundwork that can be expanded upon as your GIS projects evolve.

## Prerequisites

Before diving into the core of this walkthrough, it's imperative to have a rudimentary understanding and the necessary setup for the following technologies and tools:

1. **Angular**: A comprehensive understanding of Angular, its structure, and its component-based architecture is crucial. Make sure you have the latest version of Angular installed in your development environment (we're using 16).

2. **Jasmine**: Familiarity with Jasmine as a behavior-driven development framework for testing JavaScript code is essential. It's integral for writing test cases in our scenario.

3. **Karma**: Knowledge of Karma as a test runner for JavaScript is necessary. It's vital for executing the tests written in Jasmine and viewing the results.

4. **RxJS**: A basic understanding of Reactive Extensions for JavaScript (RxJS) is essential for managing asynchronous tasks and events in our application.

5. **Angular Material**: UI components

6. **MapLibre GL**: Prior experience with MapLibre GL is advantageous for rendering interactive maps within the application.

7. **Docker**: A basic understanding of Docker as a platform for developing, shipping, and running applications within containers is crucial for ensuring a consistent environment.

8. **Docker Compose**: Familiarity with Docker Compose for defining and running multi-container Docker applications will be beneficial for orchestrating the services required by our application.

## Create templates

1. Create `app.component.html`

```html
<mat-toolbar color="primary" class="mat-elevation-z1">
  Angular Maplibre
</mat-toolbar>
<div fxLayout="row">
  <div [fxFlex]="'30%'" [style.padding]="'10px'">
    <app-panel></app-panel>
  </div>
  <div [fxFlex]="'70%'" [style.padding]="'10px 10px 10px 0px'">
    <app-map></app-map>
  </div>
</div>
```

2. Create `panel.component.html`

```html
<mat-card class="card" style="overflow-y: auto; height: 100%">
  <mat-card-content style="height: 100%"> test </mat-card-content>
</mat-card>
```

3. Create `map.component.html`

```html
<div #mapElement class="map"></div>
```

with `map.component.scss`:

```scss
.map {
  height: calc(100vh - 64px);
  max-height: calc(100vh - 64px - 20px);
  position: relative;
}
```

## Map structure

In line with the principle of component reusability, it's prudent to establish a dedicated map service. This service will be tasked with initializing maps based on HTML elements, thereby encapsulating the map initialization logic and ensuring a clean separation of concerns. Let's delve into the creation of the `initMap` function and the utilization of a `ReplaySubject` to hold the map object, facilitating a more flexible and reactive way to interact with the map across different components (without an initial value but with the propagation of the object even after later subscription).

```typescript
import { Injectable } from "@angular/core";
import { ReplaySubject } from "rxjs";
import maplibregl from "maplibre-gl";

@Injectable()
export class MapService {
  constructor() {}

  public map$: Subject<maplibregl.Map> = new ReplaySubject();

  public initMap(target: HTMLElement): void {
    const config = {
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
      center: [0, 0],
      zoom: 0,
    };
    const map = new maplibregl.Map({
      container: target,
      style: config.style,
      center: config.center,
      zoom: config.zoom,
      maxZoom: 20,
    });
    this.map$.next(map);
  }
}
```

Following the establishment of our `MapService`, we now integrate the map initialization process into our `MapComponent`. By invoking the `initMap` method from `MapService` within the `ngOnInit` lifecycle hook of our `MapComponent`, we ensure that a map instance is created and rendered as soon as the component is initialized. This setup encapsulates the map initialization logic within the `MapService` while enabling the `MapComponent` to trigger this process, resulting in a clean and manageable implementation.

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MapService } from "src/app/services/map.service";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit {
  @ViewChild("mapElement", { static: true }) mapElement!: ElementRef;

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    this.mapService.initMap(this.mapElement.nativeElement);
  }
}
```

The map should be displayed successfully.

## Additional basic functionalities

Now let's add the capability to store information on whether the map has loaded correctly - a perfect use case for `BehaviorSubject` (initial value plus returning the last value despite later subscription). For testing, we can use the `click` event, and we will store the last coordinates of the clicked location on the map - here, a `Subject` will suffice (no initial value, no returning the last value upon later subscription). So the whole code will be:

```typescript
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, ReplaySubject, Subject } from "rxjs";
import maplibregl from "maplibre-gl";

@Injectable()
export class MapService {
  constructor() {}

  public map$: Subject<maplibregl.Map> = new ReplaySubject();
  public mapLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public clickedCoordinates$: Subject<[number, number]> = new Subject();

  public initMap(target: HTMLElement): void {
    const config = {
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
      center: [0, 0],
      zoom: 0,
    };
    const map = new maplibregl.Map({
      container: target,
      style: config.style,
      center: config.center,
      zoom: config.zoom,
      maxZoom: 20,
    });
    map.on("load", () => {
      this.mapLoaded$.next(true);
    });
    map.on("click", (e) => {
      this.clickedCoordinates$.next([e.lngLat.lat, e.lngLat.lng]);
    });
    this.map$.next(map);
  }
}
```

## Testing map component

Note: Make sure that in the `angular.json` file, under the `test` section, you have set `ChromeHeadlessNoSandbox`.

To begin, we'll set up the metadata for the tests, and create our first test to check if the component has been created successfully. Start by creating a file named `map.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatCardModule } from "@angular/material/card";
import { MapComponent } from "./map.component";
import { MapService } from "src/app/services/map.service";

describe("MapComponent", () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let mapService: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapComponent],
      providers: [MapService],
      imports: [MatCardModule],
    });
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    mapService = TestBed.inject(MapService);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
```

Upon running the command `ng test`, we should see the test successfully completed.

Next, let's create a test to check if the map has been pushed into the `ReplaySubject`:

```typescript
it("should load the map", (done) => {
  mapService.map$.subscribe((map) => {
    expect(map).toBeInstanceOf(maplibregl.Map);
    done();
  });
});
```

Following that, let's write a test to ensure the map loads correctly:

```typescript
it("should render the map", (done) => {
  mapService.mapLoaded$
    .pipe(filter((isLoaded) => isLoaded))
    .subscribe((isLoaded) => {
      expect(isLoaded).toBe(true);
      done();
    });
});
```

In the end, let's test if the passed clicked coordinates are working correctly.
Create a helper function that will simulate a click on the given coordinates:

```typescript
export const clickLngLat = (service: MapService, coords: number[]) => {
  const [lng, lat] = coords;
  const lngLat = new maplibregl.LngLat(lng, lat);
  service.mapLoaded$
    .pipe(
      filter((isLoaded) => isLoaded),
      switchMap(() => service.map$)
    )
    .subscribe((map) => {
      map.fire("click", { lngLat });
    });
};
```

Then, let's create a test to check if the clicked coordinates are propagated correctly:

```typescript
it("should register a click on the center of the map after it is loaded", (done) => {
  const center = [0, 0];
  mapService.clickedCoordinates$.subscribe((lngLat) => {
    expect(lngLat).toEqual(center);
    done();
  });
  clickLngLat(mapService, center);
});
```

Full code:

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatCardModule } from "@angular/material/card";
import { MapComponent } from "./map.component";
import { MapService } from "src/app/services/map.service";
import maplibregl from "maplibre-gl";
import { filter, switchMap } from "rxjs";

export const clickLngLat = (service: MapService, coords: number[]) => {
  const [lng, lat] = coords;
  const lngLat = new maplibregl.LngLat(lng, lat);
  service.mapLoaded$
    .pipe(
      filter((isLoaded) => isLoaded),
      switchMap(() => service.map$)
    )
    .subscribe((map) => {
      map.fire("click", { lngLat });
    });
};

describe("MapComponent", () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let mapService: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapComponent],
      providers: [MapService],
      imports: [MatCardModule],
    });
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    mapService = TestBed.inject(MapService);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load the map", (done) => {
    mapService.map$.subscribe((map) => {
      expect(map).toBeInstanceOf(maplibregl.Map);
      done();
    });
  });

  it("should render the map", (done) => {
    mapService.mapLoaded$
      .pipe(filter((isLoaded) => isLoaded))
      .subscribe((isLoaded) => {
        expect(isLoaded).toBe(true);
        done();
      });
  });

  it("should register a click on the center of the map after it is loaded", (done) => {
    const center = [0, 0];
    mapService.clickedCoordinates$.subscribe((lngLat) => {
      expect(lngLat).toEqual(center);
      done();
    });
    clickLngLat(mapService, center);
  });
});
```

## Show coordinates in another component

Let's start by adding logic to the panel component `panel.component.ts` for extracting coordinates. Thanks to the usage of the `OnPush` strategy, we can limit the amount of operations performed by Angular, forcing it to refresh the view only in cases of reloading asynchronous variables:

```typescript
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { combineLatest, map, startWith } from "rxjs";
import { MapService } from "src/app/services/map.service";

@Component({
  selector: "app-panel",
  templateUrl: "./panel.component.html",
  styleUrls: ["./panel.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
  constructor(private mapService: MapService) {}

  vm$ = combineLatest([
    this.mapService.clickedCoordinates$.pipe(startWith([null, null])),
  ]).pipe(
    map(([clickedCoordinates]) => {
      return { clickedCoordinates };
    })
  );
}
```

Let's also update the template:

```html
<mat-card class="card" style="overflow-y: auto; height: 100%">
  <mat-card-content style="height: 100%" *ngIf="vm$ | async as vm">
    <div fxLayout="row" class="easy-font" fxLayoutAlign="left">
      <div>
        <mat-icon style="font-size: 20px">near_me</mat-icon>
      </div>
      <div>Coordinate X: {{ vm.clickedCoordinates[0] }}</div>
    </div>
    <div fxLayout="row" class="easy-font" fxLayoutAlign="left">
      <div>
        <mat-icon style="font-size: 20px">near_me</mat-icon>
      </div>
      <div>Coordinate Y: {{ vm.clickedCoordinates[1] }}</div>
    </div>
  </mat-card-content>
</mat-card>
```

And let's write a test (analogous to the map component) in `panel.component.spec.ts`. Let's start with the initial view:

```typescript
it("should display placeholders", () => {
  const compiled = fixture.nativeElement;
  const coordXText = compiled.querySelector(
    "div.easy-font:nth-child(1) div:nth-child(2)"
  ).textContent;
  const coordYText = compiled.querySelector(
    "div.easy-font:nth-child(2) div:nth-child(2)"
  ).textContent;
  expect(coordXText).toContain("Coordinate X: ");
  expect(coordYText).toContain("Coordinate Y: ");
});
```

Lastly, let's ensure that the component responds appropriately to the changes in coordinates:

```typescript
it("should display coordinates", (done) => {
  const center: [number, number] = [0, 0];
  mapService.clickedCoordinates$.subscribe(() => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const coordXText = compiled.querySelector(
      "div.easy-font:nth-child(1) div:nth-child(2)"
    ).textContent;
    const coordYText = compiled.querySelector(
      "div.easy-font:nth-child(2) div:nth-child(2)"
    ).textContent;
    expect(coordXText).toContain("Coordinate X: 0");
    expect(coordYText).toContain("Coordinate Y: 0");
    done();
  });
  mapService.clickedCoordinates$.next(center);
});
```

## Summary

In this article, we explored a simplified process of integrating Maplibre GL within an Angular application. Through this exercise, we demonstrated how to structure the map service and components to handle map initialization, rendering, and interactions like clicking to capture coordinates. Moreover, the article detailed the testing strategies to validate the map component's functionality and interactions using Jasmine and Karma. The tests covered aspects like component initialization, map loading, and click interactions.

By following a test-driven approach, we ensured that our components behave as expected under different circumstances. This article showcased a basic setup, but the principles can be extended to more complex GIS applications with multiple layers, interactions, and data bindings.

The provided repository attached to this article is a practical reference, and you can inspect it further by following the steps below.

## Development

1. Run in development mode:

```bash
docker-compose up --build
```

2. Run tests

```bash
docker exec -it angular-maplibre test
```

## Deployment

Run in production mode:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
