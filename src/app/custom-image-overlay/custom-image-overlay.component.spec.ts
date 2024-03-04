import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomImageOverlayComponent } from './custom-image-overlay.component';

describe('CustomImageOverlayComponent', () => {
  let component: CustomImageOverlayComponent;
  let fixture: ComponentFixture<CustomImageOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomImageOverlayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomImageOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
