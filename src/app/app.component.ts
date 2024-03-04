import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow } from '@angular/google-maps';
import * as togpx from '@tmcw/togeojson';
import { CustomImageOverlayService } from './services/custom-image-overlay.service';

interface ExtendedPolygonOptionsDTO extends google.maps.PolygonOptions {
  name?: string;
  nome?: string;
  area_ha?: string;
  IDF?: string;
  NOM_TEMA?: string;
  NUM_AREA?: number;
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
  paths: google.maps.LatLng[] = [];
  bounds!: google.maps.LatLngBounds;
  img = 'https://s3.sa-east-1.amazonaws.com/interno.zoomrural.com.br/documentos/1e407fd1-164f-4241-ad6c-0c5253e33a38/testefundnat_4ncoeiW.png?AWSAccessKeyId=AKIATVNNEMBMGDZF2XEX&Signature=pzSuL6iZugMO0gdI9FwtgA3D8yo%3D&Expires=1709490308';
  zoom = 4;

  checkboxLabelsOBJ = [
    {
      name: 'Área cultivavel',
      // searchName: 'area_cultivavel',
      searchName: 'consolida',
      color: '#0EA5E9',
      class: 'blue-checkbox',
      isChecked: true,
    },
    {
      name: 'Área de preservação permanente',
      searchName: 'area_de_preservacao_permanente',
      color: '#572000',
      class: 'brown-checkbox',
      isChecked: true,
    },
    {
      name: 'Reserva legal',
      searchName: 'reserva_legal',
      color: '#F43F5E',
      class: 'green-checkbox',
      isChecked: true,
    },
    {
      name: 'Vegetação nativa',
      searchName: 'vegetacao_nativa',
      color: '#84CC16',
      class: 'pink-checkbox',
      isChecked: true,
    },
    {
      name: 'Utilidade pública',
      searchName: 'publica',
      color: '#4B5563',
      isChecked: true,
    },
    {
      name: "Curso D'água",
      searchName: 'curso_d\'agua',
      color: '#075985',
      isChecked: true,
    },
    {
      name: "Outros",
      searchName: 'outros',
      color: 'purple',
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

  handlePolygonClick(event: google.maps.PolyMouseEvent, polygon?: ExtendedPolygonDTO) {
    console.log(event);

    const infoWindow = new google.maps.InfoWindow({
      content: `
        Nome: ${polygon?.name} <br>
        Área: ${polygon?.options ? polygon?.options.area_ha : ''} ha <br>
        Nome: ${polygon?.options ? polygon.options.nome : ''} <br>`,
      position: event.latLng,
    });

    infoWindow.open(this.map);
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
        this.handlePolygonClick(event, poly);
      });
    });

    console.log(polygons);
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
        fillOpacity: feature.properties['fill-opacity'] || 1,
        strokeOpacity: feature.properties['stroke-opacity'] || 1,
        strokeWeight: feature.properties['stroke-width'] || 1,
        name: feature.properties.name,
        nome: feature.properties.nome,
        area_ha: feature.properties.area_ha,
      };

      this.paths = paths;
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

  pegarPoligonoPeloNome(event: any, obj: any): any {
    /**
     *
      IDF: "605525"
      NOM_TEMA: "Curso d'Ã¡gua natural de atÃ© 10 metros"
      NUM_AREA: 0.186811
      fill: "#0000ff"
      fill-opacity: 1
      icon-color: "#efebe7"
      icon-opacity: 1
      stroke: "#5555ff"
      stroke-opacity: 1
      stroke-width: 10
      styleUrl: "#falseColor160"
     */

    let polygonsIncluidos: ExtendedPolygonDTO[] = [];
    polygonsIncluidos = this.polygons.filter((polygon)=> {
      if (obj.searchName === 'outros') {
        return !polygon.name?.toLowerCase().includes('consolidada') &&
        !polygon.name?.toLowerCase().includes('area_de_preservacao_permanente') &&
        !polygon.name?.toLowerCase().includes('reserva_legal') &&
        !polygon.name?.toLowerCase().includes('vegetacao_nativa') &&
        !polygon.name?.toLowerCase().includes('publica') &&
        !polygon.name?.toLowerCase().includes('curso_d\'agua');
      }
      return polygon.name?.toLowerCase().includes(obj.searchName) || this.normalizeString(polygon?.options?.NOM_TEMA).includes(obj.searchName)
    });
    if (event.checked) {
      polygonsIncluidos.map((polygon) => {
        // polygon.setOptions({fillColor: obj.color, strokeColor: 'black'});
        polygon.setVisible(true);
      });
    } else {
      polygonsIncluidos.map((polygon) => polygon.setVisible(false));
    }
  }

  sobreporImagem(paths: any[]): void {
    const bounds = new google.maps.LatLngBounds();
    paths.forEach((path: any) => bounds.extend(path));
    this.bounds = bounds;
    const overlay = new CustomImageOverlayService(this.bounds, this.img);
    overlay.setMap(this.map);
  }

  normalizeString(str: string | undefined): string {
    if (!str) return '';

    const decomposed = str.normalize('NFD');
    const withoutAccents = decomposed.replace(/[\u0300-\u036f]/g, '');
    return withoutAccents.toLowerCase();
  }
}
