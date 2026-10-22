import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { BuildingItem } from '../api/client';

interface DubaiMapProps {
  buildings: BuildingItem[];
  selectedBuildingId?: string;
  onSelectBuilding: (buildingId: string) => void;
  lang?: string;
}

export const DubaiMap: React.FC<DubaiMapProps> = ({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map centered over Dubai
      const map = L.map(mapContainerRef.current, {
        center: [25.14, 55.22],
        zoom: 11,
        scrollWheelZoom: true,
      });

      // CartoDB Positron / Voyager high quality clean tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    buildings.forEach((b) => {
      // Determine marker color based on status
      const isCritical = b.operational_status.includes('Critical');
      const isAttention = b.operational_status.includes('Attention') || b.operational_status.includes('Degradation');
      const pinColor = isCritical ? '#dc2626' : isAttention ? '#d97706' : '#059669';
      const isSelected = b.id === selectedBuildingId;

      const customIcon = L.divIcon({
        className: 'custom-building-pin',
        html: `
          <div style="
            background-color: ${pinColor};
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 13px;
            font-weight: bold;
            transition: all 0.2s ease;
          ">
            🏙️
          </div>
        `,
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13],
      });

      const marker = L.marker([b.latitude, b.longitude], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="min-width: 220px; font-family: 'Inter', sans-serif;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${b.name}</h4>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">📍 ${b.district}</p>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; padding: 4px 8px; background: #f8fafc; border-radius: 6px;">
            <span>GFA: <b>${b.gross_floor_area_m2.toLocaleString()} m²</b></span>
            <span>Floors: <b>${b.floors}</b></span>
          </div>
          <div style="font-size: 11px; margin-bottom: 8px;">
            Status: <b style="color: ${pinColor};">${b.operational_status}</b>
          </div>
          <button id="btn-select-${b.id}" style="
            width: 100%;
            padding: 6px 10px;
            background: #0d9488;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          ">
            View Live Telemetry & AI Dossier
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${b.id}`);
        if (btn) {
          btn.onclick = () => onSelectBuilding(b.id);
        }
      });

      marker.on('click', () => {
        onSelectBuilding(b.id);
      });

      markersRef.current[b.id] = marker;
    });

    return () => {};
  }, [buildings, selectedBuildingId, onSelectBuilding]);

  return (
    <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 text-xs shadow-md">
        <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          Dubai Property Portfolio Telemetry
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600"></span> Optimal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Attention</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600"></span> Critical</span>
        </div>
      </div>
    </div>
  );
};
