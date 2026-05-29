"use client";

import { useEffect, useRef, useState } from "react";
import { villages as defaultVillages } from "@/lib/mockData";
import { getRiskColor } from "@/utils/helpers";
import type { Village } from "@/types/report";

interface MapViewProps {
  villages?: Village[];
  selectedVillage?: string;
}

// Google Maps Slate/Light-Grey Minimalist Theme Styles Array
const gmapsLightTheme = [
  { "elementType": "geometry", "stylers": [{ "color": "#f8fafc" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }, { "weight": 2 }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#1e293b" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#475569" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#f0fdf4" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#15803d" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#e2e8f0" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#64748b" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#e0f2fe" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#0369a1" }]
  }
];

export default function MapView({ villages = defaultVillages, selectedVillage }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const activeInfoWindowRef = useRef<any>(null);

  // Track village elements for dynamic interaction (pan, zoom, infoWindow)
  const villageElementsRef = useRef<{
    [name: string]: {
      marker: any;
      infoWindow: any;
      center: { lat: number; lng: number };
    };
  }>({});

  // Load Google Maps Script Tag Dynamically
  useEffect(() => {
    if ((window as any).google && (window as any).google.maps) {
      setScriptLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDliJ9lYUXyT6Ot8Qbk9QtfMfaSHXmwMmY";
    const scriptId = "google-maps-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const handleScriptLoad = () => setScriptLoaded(true);
    script.addEventListener("load", handleScriptLoad);

    return () => {
      script.removeEventListener("load", handleScriptLoad);
    };
  }, []);

  // Initialize Map and Draw Overlays
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;

    const google = (window as any).google;

    // Create Map if it does not exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 23.5, lng: 87.5 },
        zoom: 7.5,
        styles: gmapsLightTheme,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
      });
    }

    const map = mapInstanceRef.current;

    // Clear previous markers & circles
    markersRef.current.forEach((m) => m.setMap(null));
    circlesRef.current.forEach((c) => c.setMap(null));
    markersRef.current = [];
    circlesRef.current = [];
    villageElementsRef.current = {};

    // Create bounds to fit if ASHA workers have filtered districts
    const bounds = new google.maps.LatLngBounds();

    // Draw village hotspots
    villages.forEach((village) => {
      const color = getRiskColor(village.riskLevel);
      const center = { lat: village.latitude, lng: village.longitude };
      bounds.extend(center);

      // 1. Primary Risk Hotspot Circle Overlay
      const radiusMeters = village.riskLevel === "HIGH" ? 12000 : village.riskLevel === "MEDIUM" ? 8000 : 5000;
      const circle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 1.5,
        fillColor: color,
        fillOpacity: 0.25,
        map: map,
        center: center,
        radius: radiusMeters,
      });
      circlesRef.current.push(circle);

      // 2. Pulse / Glowing Outer Ring for High Risk villages
      if (village.riskLevel === "HIGH") {
        const outerCircle = new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.3,
          strokeWeight: 1,
          fillColor: color,
          fillOpacity: 0.05,
          map: map,
          center: center,
          radius: radiusMeters * 1.8,
        });
        circlesRef.current.push(outerCircle);
      }

      // 3. Center Position Marker
      const marker = new google.maps.Marker({
        position: center,
        map: map,
        title: village.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: village.riskLevel === "HIGH" ? 6 : village.riskLevel === "MEDIUM" ? 4 : 3,
          fillColor: color,
          fillOpacity: 1.0,
          strokeColor: "#ffffff",
          strokeWeight: 1,
        },
      });
      markersRef.current.push(marker);

      // InfoWindow Content
      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 180px; padding: 10px 12px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 18px rgba(15, 23, 42, 0.08);">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 4px;">
            📍 District ${village.name}
          </h3>
          <div style="margin-bottom: 6px;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; letter-spacing: 0.03em;
              background: ${color}15; color: ${color}; border: 1px solid ${color}40;">
              ${village.riskLevel}
            </span>
          </div>
          <div style="font-size: 12px; color: #475569; font-weight: 600;">
            Surveillance Risk: <span style="color: ${color}; font-weight: 800;">${village.riskScore}% Score</span>
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 6px; font-family: monospace;">
            Lat: ${village.latitude.toFixed(4)}<br/>Lng: ${village.longitude.toFixed(4)}
          </div>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: popupContent,
        ariaLabel: village.name,
      });

      // Save references for dynamic pan/zoom
      villageElementsRef.current[village.name.toLowerCase()] = {
        marker,
        infoWindow,
        center,
      };

      // Bind click triggers to both marker and circle
      const handleTriggerClick = () => {
        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
        }
        infoWindow.open({
          anchor: marker,
          map,
        });
        activeInfoWindowRef.current = infoWindow;
      };

      marker.addListener("click", handleTriggerClick);
      circle.addListener("click", handleTriggerClick);
    });

    // Fit map bounds / Zoom dynamically based on ASHA worker's active villages scope
    if (villages.length > 0) {
      if (villages.length === 1) {
        map.setCenter({ lat: villages[0].latitude, lng: villages[0].longitude });
        map.setZoom(11);
      } else if (villages.length < defaultVillages.length) {
        map.fitBounds(bounds);
      } else {
        map.setCenter({ lat: 23.5, lng: 87.5 });
        map.setZoom(7.5);
      }
    }

  }, [scriptLoaded, villages]);

  // Handle selectedVillage changes from the dropdown (Pan & Zoom in close)
  useEffect(() => {
    if (!scriptLoaded || !mapInstanceRef.current || !selectedVillage) return;

    const matched = villageElementsRef.current[selectedVillage.toLowerCase()];
    if (matched) {
      const { marker, infoWindow, center } = matched;
      const map = mapInstanceRef.current;

      // Smoothly pan and zoom into the selected location
      map.panTo(center);
      map.setZoom(11.5);

      // Programmatically open its infoWindow
      if (activeInfoWindowRef.current) {
        activeInfoWindowRef.current.close();
      }
      infoWindow.open({
        anchor: marker,
        map,
      });
      activeInfoWindowRef.current = infoWindow;
    }
  }, [selectedVillage, scriptLoaded]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      circlesRef.current.forEach((c) => c.setMap(null));
      if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
      mapInstanceRef.current = null;
      villageElementsRef.current = {};
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl"
      id="outbreak-map"
      style={{ minHeight: "500px", background: "#f8fafc" }}
    />
  );
}
