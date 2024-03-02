import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow } from '@angular/google-maps';
import * as togpx from '@tmcw/togeojson';

interface ExtendedPolygonOptionsDTO extends google.maps.PolygonOptions {
  name?: string;
  nome?: string;
  area_ha?: string;
}

class ExtendedPolygonDTO extends google.maps.Polygon {
  options?: ExtendedPolygonOptionsDTO;
  name?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('map') mapContainer!: ElementRef;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  map!: google.maps.Map;
  options: google.maps.MapOptions = {
    mapTypeId: 'satellite',
  }
  center: google.maps.LatLngLiteral = {
    lat: -14.235004,
    lng: -51.92528,
  };
  polygons: ExtendedPolygonDTO[] = [];
  zoom = 4;

  checkboxLabelsOBJ = [
    {
      name: 'Área cultivavel',
      sigla: 'area_cultivavel',
      isChecked: true,
    },
    {
      name: 'Área de preservação permanente',
      sigla: 'area_de_preservacao_permanente',
      isChecked: true,
    },
    {
      name: 'Reserva legal',
      sigla: 'reserva_legal',
      isChecked: true,
    },
    {
      name: 'Vegetação nativa',
      sigla: 'vegetacao_nativa',
      isChecked: true,
    },
    {
      name: 'Utilidade pública',
      sigla: 'utilidade_publica',
      isChecked: true,
    },
    {
      name: "Curso D'água",
      sigla: 'curso_d\'agua',
      isChecked: true,
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  mapClicked(event: any) {
    console.log(event);
  }

  buscarMap(map: any) {
    this.map = map;
  }

  onFileSelected(event: any) {
    console.log(event.target.files[0]);

    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const kmlString = event?.target?.result as string;
      const geoJson = this.kmlToGeoJson(kmlString);
      this.geoJsonParaLatLngLiteral(geoJson);
    };

    reader.readAsText(file);
  }

  handlePolygonClick(event: google.maps.PolyMouseEvent) {
    console.log(event);
  }

  kmlToGeoJson(kmlString: string): any {
    const parser = new DOMParser();
    const root = parser.parseFromString(kmlString, 'application/xml');
    const geoJson = togpx.kml(root);
    return geoJson;
  }

  geoJsonParaLatLngLiteral(geoJson: any): ExtendedPolygonOptionsDTO[] {
    const polygons: google.maps.PolygonOptions[] = [];

    geoJson.features.forEach((feature: any) => {
      if (feature.geometry.type === 'GeometryCollection') {
        this.processarGeometryCollection(feature, polygons);
      } else {
        this.processarGeometry(feature.geometry, feature, polygons);
      }
    });

    polygons.forEach((polygonOptions) => {
      const poly = new ExtendedPolygonDTO(polygonOptions);
      this.polygons.push(poly);

      poly.setMap(this.map);
      poly.addListener('click', (event: google.maps.PolyMouseEvent) => {
        this.handlePolygonClick(event);
      });
    });

    return polygons;
  }

  processarGeometryCollection(feature: any, polygons: google.maps.PolygonOptions[]) {
    feature.geometry.geometries.forEach((geometry: any) => {
      this.processarGeometry(geometry, feature, polygons);
    });
  }

  processarGeometry(geometry: any, feature: any, polygons: google.maps.PolygonOptions[]): any {
    let paths: google.maps.LatLng[] = [];

    if (geometry.type === 'Polygon') {
      paths = this.pegarPolygonsPaths(geometry);
    } else if (geometry.type === 'MultiPolygon') {
      paths = this.pegarMultiPolygonsPaths(geometry);
    }

    if (paths.length > 0) {
      this.pegarCentro(paths);

      const clippedPolygon: ExtendedPolygonOptionsDTO = {
        paths: paths,
        fillColor: feature.properties.fill || '#0284C7',
        strokeColor: feature.properties.stroke || 'black',
        name: feature.properties.name,
        nome: feature.properties.nome,
        area_ha: feature.properties.area_ha,
      };

      polygons.push(clippedPolygon);
    }
  }

  pegarPolygonsPaths(geometry: any): google.maps.LatLng[] {
    return geometry.coordinates[0].map(
      (coord: any) => new google.maps.LatLng(coord[1], coord[0])
    );
  }

  pegarMultiPolygonsPaths(geometry: any): google.maps.LatLng[] {
    let paths: google.maps.LatLng[] = [];

    geometry.coordinates.forEach((polygonCoordinates: any[]) => {
      const polygonPaths = polygonCoordinates[0].map(
        (coord: any) => new google.maps.LatLng(coord[1], coord[0])
      );
      paths.push(...polygonPaths);
    });

    return paths;
  }

  pegarCentro(paths: google.maps.MVCArray<any> | any[]): void {
    const bounds = new google.maps.LatLngBounds();
    paths.forEach((path: any) => bounds.extend(path));
    const centerLatLng = bounds.getCenter();
    this.center = {
      lat: centerLatLng.lat(),
      lng: centerLatLng.lng(),
    };

    this.zoom = 16;
  }

  pegarPoligonoPeloNome(event: any, nome: string): any {
    let polygonsIncluidos: ExtendedPolygonDTO[] = [];
    polygonsIncluidos = this.polygons.filter((polygon)=> polygon.name?.toLowerCase().includes(nome));
    if (event.checked) {
      polygonsIncluidos.map((polygon) => polygon.setVisible(true));
    } else {
      polygonsIncluidos.map((polygon) => polygon.setVisible(false));
    }
  }
}
