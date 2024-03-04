import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CustomImageOverlayService extends google.maps.OverlayView {
  private div!: HTMLElement | null;

  constructor(
    public bounds: google.maps.LatLngBounds,
    @Inject(String) public image: string
  ) {
    super();
    this.div = null;
  }

  /**
   * onAdd is called when the map's panes are ready and the overlay has been
   * added to the map.
   */
  override onAdd(): void {
    this.div = document.createElement('div');
    this.div.style.borderStyle = 'none';
    this.div.style.borderWidth = '0px';
    this.div.style.position = 'absolute';

    // Create the img element and attach it to the div.
    const img = document.createElement('img');

    img.src = this.image;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    this.div.appendChild(img);

    // Add the element to the "overlayLayer" pane.
    const panes = this.getPanes();

    if (panes) {
      panes.overlayLayer.appendChild(this.div);
    }
  }

  override draw(): void {
    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    const overlayProjection = this.getProjection();

    if (!overlayProjection) {
        // The map projection is not ready yet.
        return;
    }

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    const sw = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getSouthWest()
    );
    const ne = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getNorthEast()
    );

    // Resize the image's div to fit the indicated dimensions.
    if (this.div && sw && ne) {
        // Set the position and size of the div
        this.div.style.left = sw.x + 'px';
        this.div.style.top = ne.y + 'px';
        this.div.style.width = (ne.x - sw.x) + 'px';
        this.div.style.height = (sw.y - ne.y) + 'px';

        // Set the position and size of the image
        this.div.querySelector('img')?.setAttribute('src', this.image);
        this.div.querySelector('img')?.setAttribute('style', `
            width: ${ne.x - sw.x}px;
            height: ${sw.y - ne.y}px;
            position: absolute;
            left: 0;
            top: 0;
        `);
    }
}


  override onRemove(): void {
    if (this.div) {
      (this.div.parentNode as HTMLElement).removeChild(this.div);
      this.div = null;
    }
  }
}
