import { TestBed } from '@angular/core/testing';

import { CustomImageOverlayService } from './custom-image-overlay.service';

describe('CustomImageOverlayService', () => {
  let service: CustomImageOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomImageOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
