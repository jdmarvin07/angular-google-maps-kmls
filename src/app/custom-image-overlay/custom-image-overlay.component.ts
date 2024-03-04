import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-image-overlay',
  templateUrl: './custom-image-overlay.component.html',
  styleUrls: ['./custom-image-overlay.component.scss']
})
export class CustomImageOverlayComponent implements OnInit, OnDestroy {
  @Input() map!: google.maps.Map;
  @Input() bounds!: google.maps.LatLngBounds;
  @Input() image!: string;

  private overlay!: google.maps.OverlayView;

  constructor(
    private zone: NgZone,
  ) { }

  ngOnInit(): void {
    this.overlay = new google.maps.OverlayView();

    this.overlay.onAdd = () => {
      const img = document.createElement('img');
      img.src = this.image;
      img.style.position = 'absolute';
      img.style.width = '100%';
      img.style.height = '100%';
      const panes = this.overlay.getPanes();
      if (panes) {
        panes.overlayLayer.appendChild(img);
      }
    };

    this.overlay.draw = () => {
      const projection = this.overlay.getProjection();
      const sw = projection.fromLatLngToDivPixel(this.bounds.getSouthWest());
      const ne = projection.fromLatLngToDivPixel(this.bounds.getNorthEast());

      const panes = this.overlay.getPanes();
      if (sw && ne && panes) {
        const div = panes.overlayLayer.firstChild as HTMLElement;
        div.style.left = `${sw.x}px`;
        div.style.top = `${ne.y}px`;
        div.style.width = `${ne.x - sw.x}px`;
        div.style.height = `${sw.y - ne.y}px`;
      }
      // this.zone.run(() => {
      // });
    };

    this.overlay.setMap(this.map);
  }

  ngOnDestroy(): void {
    this.overlay.setMap(null);
  }
}
