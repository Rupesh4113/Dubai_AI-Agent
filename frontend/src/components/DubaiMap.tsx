import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BuildingItem } from '../api/client';
import { t } from '../i18n/translations';
import { MapPin, RefreshCw } from 'lucide-react';

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
  lang = 'en',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [mapLayer, setMapLayer] = useState<'osm' | 'osm_humanitarian' | 'schematic'>('osm');
  const [tileError, setTileError] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance before creating a new one
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map centered over Dubai Coordinates
    const map = L.map(mapContainerRef.current, {
      center: [25.14, 55.24],
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // Select open-source OpenStreetMap tile layer
    const tileUrl =
      mapLayer === 'osm_humanitarian'
        ? 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    tileLayer.on('tileerror', () => {
      setTileError(true);
    });

    tileLayer.addTo(map);
    mapInstanceRef.current = map;

    // Force Leaflet recalculation after DOM layout settles
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    // Render Markers for each Dubai facility
    markersRef.current = {};
    buildings.forEach((b) => {
      const isCritical = b.operational_status.includes('Critical');
      const isAttention =
        b.operational_status.includes('Attention') ||
        b.operational_status.includes('Degradation');
      const pinColor = isCritical ? '#dc2626' : isAttention ? '#d97706' : '#059669';
      const isSelected = b.id === selectedBuildingId;

      const customIcon = L.divIcon({
        className: 'custom-building-pin',
        html: `
          <div style="
            background-color: ${pinColor};
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${isSelected ? '16px' : '13px'};
            font-weight: bold;
            cursor: pointer;
            position: relative;
            animation: ${isCritical ? 'pulse 1.5s infinite' : 'none'};
          ">
            🏙️
            ${isSelected ? '<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #0d9488; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          </div>
        `,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
      });

      const marker = L.marker([b.latitude, b.longitude], { icon: customIcon }).addTo(map);

      const statusBadge = isCritical
        ? `<span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">${b.operational_status}</span>`
        : isAttention
        ? `<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">${b.operational_status}</span>`
        : `<span style="background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">${b.operational_status}</span>`;

      marker.bindPopup(`
        <div style="min-width: 240px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">${b.name}</h4>
          </div>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">📍 ${b.district} • ${b.id}</p>
          <div style="margin-bottom: 8px;">${statusBadge}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 8px; padding: 6px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div>GFA: <b>${b.gross_floor_area_m2.toLocaleString()} m²</b></div>
            <div>Floors: <b>${b.floors}</b></div>
            <div>Cooling: <b>${b.cooling_system_type}</b></div>
            <div>Target COP: <b>${b.target_cop}</b></div>
          </div>
          <button id="btn-select-${b.id}" style="
            width: 100%;
            padding: 7px 10px;
            background: #0d9488;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          ">
            ${t('map_view_telemetry', lang)}
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

    // Cleanup when unmounting or dependencies change
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [buildings, selectedBuildingId, onSelectBuilding, mapLayer, lang]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-600" />
            {t('map_title', lang)}
          </span>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            {t('map_coordinates', lang)}
          </span>
        </div>

        {/* Map Layer Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setMapLayer('osm')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              mapLayer === 'osm'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            OpenStreetMap Standard
          </button>
          <button
            onClick={() => setMapLayer('osm_humanitarian')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              mapLayer === 'osm_humanitarian'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            OSM Humanitarian (HOT)
          </button>
          <button
            onClick={() => setMapLayer('schematic')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              mapLayer === 'schematic'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Schematic Grid View
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[480px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        {mapLayer === 'schematic' || tileError ? (
          /* High-Reliability Dubai SVG Schematic View */
          <div className="w-full h-full bg-slate-900 text-white p-6 flex flex-col justify-between relative overflow-hidden select-none">
            {/* Dubai Coastline & Grid graphic background */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 1000 500" fill="none">
                <path
                  d="M0,150 Q250,180 500,220 T1000,320"
                  stroke="#14b8a6"
                  strokeWidth="6"
                  strokeDasharray="8 8"
                />
                <circle cx="350" cy="200" r="120" stroke="#06b6d4" strokeWidth="2" />
                <circle cx="350" cy="200" r="80" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M700,100 L850,450" stroke="#f59e0b" strokeWidth="2" opacity="0.4" />
              </svg>
            </div>

            <div className="flex items-center justify-between z-10">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-teal-400 font-bold">
                  Dubai Coastline & Urban Corridor • Open-Source Geospatial Grid
                </span>
                <h3 className="text-sm font-bold text-slate-100">
                  Dubai Smart Building Geospatial Network
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Active Telemetry Mesh
              </span>
            </div>

            {/* Interactive Building Facility Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 z-10 my-auto">
              {buildings.map((b) => {
                const isSelected = b.id === selectedBuildingId;
                const isCritical = b.operational_status.includes('Critical');
                const isAttention =
                  b.operational_status.includes('Attention') ||
                  b.operational_status.includes('Degradation');
                const badgeColor = isCritical
                  ? 'border-red-500 bg-red-950/40 text-red-200'
                  : isAttention
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                  : 'border-emerald-500 bg-emerald-950/40 text-emerald-200';

                return (
                  <div
                    key={b.id}
                    onClick={() => onSelectBuilding(b.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-400 bg-slate-800/90 shadow-lg ring-2 ring-teal-500/50 scale-[1.02]'
                        : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">🏙️</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                        {b.operational_status}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white truncate">{b.name}</div>
                    <div className="text-[11px] text-slate-400 mb-2">📍 {b.district}</div>
                    <div className="text-[10px] text-slate-300 space-y-0.5 pt-1.5 border-t border-slate-700/60 font-mono">
                      <div>GFA: {b.gross_floor_area_m2.toLocaleString()} m²</div>
                      <div>Floors: {b.floors}</div>
                      <div>Lat: {b.latitude.toFixed(3)}°N</div>
                      <div>Lon: {b.longitude.toFixed(3)}°E</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between z-10 border-t border-slate-800 pt-2">
              <span>Projection: Dubai Municipality GRCh38 / WGS84 Datum</span>
              <button
                onClick={() => {
                  setTileError(false);
                  setMapLayer('osm');
                }}
                className="text-teal-400 hover:text-teal-300 underline font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Switch to OpenStreetMap Tiles
              </button>
            </div>
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        )}

        {/* Floating Dubai Legend Overlay */}
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs shadow-md">
          <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            Dubai Portfolio Telemetry
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              {t('map_optimal', lang)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              {t('map_attention', lang)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              {t('map_critical_status', lang)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
