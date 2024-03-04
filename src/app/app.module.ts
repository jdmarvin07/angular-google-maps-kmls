import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GoogleMapsModule, MapPolygon } from '@angular/google-maps';
import { MaterialModule } from './angular-material/material.module';
import { CustomImageOverlayComponent } from './custom-image-overlay/custom-image-overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    CustomImageOverlayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
