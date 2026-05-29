"use client";

import { useEffect, useRef } from "react";
import { villages as defaultVillages } from "@/lib/mockData";
import { getRiskColor } from "@/utils/helpers";
import type { Village } from "@/types/report";

interface MapViewProps {
  villages?: Village[];
}

export default function MapView({ villages = defaultVillages }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import Leaflet (avoids SSR issues)
    import("leaflet").then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [23.5, 87.5],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add village markers
      villages.forEach((village) => {
        const color = getRiskColor(village.riskLevel);

        // Custom circle marker with pulsing effect for high risk
        const marker = L.circleMarker([village.latitude, village.longitude], {
          radius: village.riskLevel === "HIGH" ? 14 : village.riskLevel === "MEDIUM" ? 10 : 7,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.4,
        }).addTo(map);

        // Popup
        marker.bindPopup(`
          <div style="min-width: 180px; padding: 4px;">
            <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #f1f5f9;">
              📍 ${village.name}
            </h3>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
                background: ${color}22; color: ${color}; border: 1px solid ${color}44;">
                ${village.riskLevel}
              </span>
            </div>
            <div style="font-size: 13px; color: #94a3b8;">
              Risk Score: <span style="color: ${color}; font-weight: 700;">${village.riskScore}%</span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
              Lat: ${village.latitude.toFixed(4)}, Lng: ${village.longitude.toFixed(4)}
            </div>
          </div>
        `);

        // Add outer glow ring for HIGH risk
        if (village.riskLevel === "HIGH") {
          L.circleMarker([village.latitude, village.longitude], {
            radius: 22,
            fillColor: color,
            color: color,
            weight: 1,
            opacity: 0.3,
            fillOpacity: 0.08,
          }).addTo(map);
        }
      });

      // Add a legend
      const legend = new (L.Control.extend({
        onAdd: function () {
          const div = L.DomUtil.create("div", "");
          div.style.cssText =
            "background: rgba(15,23,42,0.9); backdrop-filter: blur(12px); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(148,163,184,0.15); font-size: 12px; color: #e2e8f0;";
          div.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Risk Level</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 8px #ef444466;"></span> High (≥80)
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 8px #f59e0b66;"></span> Medium (50–79)
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b98166;"></span> Low (&lt;50)
              </div>
            </div>
          `;
          return div;
        },
      }))({ position: "bottomright" });

      legend.addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [villages]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div
        ref={mapRef}
        className="w-full h-full rounded-2xl"
        id="outbreak-map"
        style={{ minHeight: "500px" }}
      />
    </>
  );
}
