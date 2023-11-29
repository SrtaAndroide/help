import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';
import { supabase } from '../services/supabase.service';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-viaje',
  templateUrl: './viaje.page.html',
  styleUrls: ['./viaje.page.scss'],
})
export class ViajePage implements OnInit {

  @ViewChild('map', { static: true }) mapElement?: ElementRef;
  map?: GoogleMap;

  origen: { lat: number, lng: number, nombre: string } | null = null;
  destino: { lat: number, lng: number, nombre: string } | null = null;

  constructor
  (private route: ActivatedRoute) 
  {}

  ngOnInit() {
    this.fetchViajeData();
  }

  async fetchViajeData() {
    
    const viajeId = this.route.snapshot.paramMap.get('id');
    if (viajeId) {
      const { data: viajeData, error } = await supabase
        .from('viaje')
        .select(`
          *,
          origen_ruta: origen!inner (latitud, longitud, nombre_ruta),
          destino_ruta: destino!inner (latitud, longitud, nombre_ruta)
        `)
        .eq('id', viajeId)
        .single();
      if (error) {
        console.error('Error al obtener datos:', error);
        return;
      }
  
      if (viajeData.origen_ruta && viajeData.destino_ruta) {
        this.origen = {
          lat: parseFloat(viajeData.origen_ruta.latitud),
          lng: parseFloat(viajeData.origen_ruta.longitud),
          nombre: viajeData.origen_ruta.nombre_ruta
        };
        this.destino = {
          lat: parseFloat(viajeData.destino_ruta.latitud),
          lng: parseFloat(viajeData.destino_ruta.longitud),
          nombre: viajeData.destino_ruta.nombre_ruta
        };
  

        console.log(viajeData.origen_ruta);
        console.log(viajeData.destino_ruta);

      }
    }
  }

  async ionViewDidEnter() {
    this.createMap();
  }
  
  async createMap() {
    if (this.mapElement && this.mapElement.nativeElement) {
      this.map = await GoogleMap.create({
        id: 'my-map', 
        apiKey: environment.mapsKey,
        element: this.mapElement.nativeElement,
        config: {
          center: {
            lat: -33.03350031485377,
            lng: -71.53312509139612,
          },
          zoom: 12,
        }
      });
      await this.addMarkers();
    } else {
      console.error('Elemento del mapa no es un elemento DOM válido');
    }
  }

  async addMarkers() {
    if (this.map && this.origen && this.destino) {
      const markers: Marker[] = [
        {
          coordinate: {
            lat: this.origen.lat,
            lng: this.origen.lng,
          },
          title: this.origen.nombre,
          snippet: this.origen.nombre,
        },
        {
          coordinate: {
            lat: this.destino.lat,
            lng: this.destino.lng,
          },
          title: this.destino.nombre,
          snippet: this.destino.nombre,
        },
      ];
    
      await this.map.addMarkers(markers);
    }
  }
}
  



