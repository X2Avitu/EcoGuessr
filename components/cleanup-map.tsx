"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import type { JSX } from "react"
import type { DirtySpot } from "@/types/dirty-spot";

type CleanupMapProps = {
  userLocation: { lat: number; lng: number };
  spots: DirtySpot[];
  selectedSpotId: string | null;
  onSpotSelect: (spotId: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  /** Increment after dropping a pin to pan/zoom back to the default city view */
  viewResetNonce?: number;
};

export function CleanupMap({
  userLocation,
  spots,
  selectedSpotId: propsSelectedSpotId,
  onSpotSelect,
  onMapClick,
  viewResetNonce = 0,
}: CleanupMapProps): JSX.Element {
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(propsSelectedSpotId);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    if (propsSelectedSpotId !== selectedSpotId) {
      setSelectedSpotId(propsSelectedSpotId);
    }
  }, [propsSelectedSpotId]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: "AIzaSyBR9R06eZuZHKXCoP6sDamTtUjpBKMauWY",
      version: "weekly",
    });
    
    loader.load().then(async () => {
      try {
        const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
        const { InfoWindow } = (await google.maps.importLibrary("maps")) as any;
        
        const mapEl = document.getElementById("cleanup-map");
        if (!mapEl) return;
        
        if (!mapRef.current) {
          const darkMapStyle = [{"elementType":"geometry","stylers":[{"color":"#1a1a1a"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#1a1a1a"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#2a2a2a"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#0a0a0a"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]}];

          mapRef.current = new Map(mapEl, {
            center: userLocation,
            zoom: 14,
            disableDefaultUI: true,
            zoomControl: true,
            styles: darkMapStyle
          });

          if (onMapClick) {
            mapRef.current.addListener("click", (e: any) => {
              if (e.latLng) {
                onMapClick(e.latLng.lat(), e.latLng.lng());
              }
            });
          }
          
          infoWindowRef.current = new InfoWindow();
          setMapsLoaded(true);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    });
    
    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, []);

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;

    const setupMarkers = async () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      const { Marker } = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;
      
      spots.forEach((spot) => {
        if (spot.lat && spot.lng) {
          let iconUrl = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"; // small
          if (spot.severity === "medium") iconUrl = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
          if (spot.severity === "large") iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

          const marker = new Marker({
            position: { lat: spot.lat, lng: spot.lng },
            map: mapRef.current!,
            title: spot.title,
            icon: iconUrl,
            animation: google.maps.Animation.DROP,
          });
          
          marker.addListener("click", () => {
            if (infoWindowRef.current) {
              const severityColor = spot.severity === 'large' ? 'text-red-500' : spot.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500';
              const contentString = `
                <div class="p-3 text-black min-w-[200px]">
                  <h3 class="font-bold text-lg mb-1 leading-tight font-bebas text-2xl">${spot.title.toUpperCase()}</h3>
                  <div class="text-xs font-bold uppercase mb-2 ${severityColor}">${spot.severity} SEVERITY</div>
                  <p class="text-sm mb-2 text-gray-700">${spot.description}</p>
                  <p class="text-xs text-gray-500 mb-2">Est. ${spot.estimatedPeople} people · ${spot.estimatedMinutes} mins</p>
                  <button id="host-cleanup-${spot.id}" class="w-full bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#B8FF3C] px-3 py-2 rounded text-sm font-bold uppercase tracking-wider transition-colors">
                    Host Cleanup
                  </button>
                </div>
              `;
              
              infoWindowRef.current.setContent(contentString);
              infoWindowRef.current.open(mapRef.current, marker);
            }
            
            setSelectedSpotId(spot.id);
            onSpotSelect(spot.id);
          });
          
          markersRef.current.push(marker);
        }
      });
    };
    
    setupMarkers();
  }, [mapsLoaded, spots, onSpotSelect]);

  useEffect(() => {
    if (!mapRef.current || !mapsLoaded) return;

    let currentLocation = userLocation;

    if (selectedSpotId) {
      const selectedSpot = spots.find((p) => p.id === selectedSpotId);
      if (selectedSpot && selectedSpot.lat && selectedSpot.lng) {
        currentLocation = { lat: selectedSpot.lat, lng: selectedSpot.lng };
      }
    }

    mapRef.current.panTo(currentLocation);
    if (selectedSpotId) {
      mapRef.current.setZoom(16);
    } else {
      mapRef.current.setZoom(14);
    }
  }, [selectedSpotId, userLocation, spots, mapsLoaded]);

  useEffect(() => {
    if (!mapRef.current || !mapsLoaded || viewResetNonce <= 0) return;
    mapRef.current.panTo(userLocation);
    mapRef.current.setZoom(14);
  }, [viewResetNonce, userLocation, mapsLoaded]);

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <div id="cleanup-map" className="w-full h-full" />
    </div>
  );
}
