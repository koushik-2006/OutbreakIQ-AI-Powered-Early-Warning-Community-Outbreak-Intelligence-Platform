import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Maximize2, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Region } from '../../types/region';
import { useNavigate } from 'react-router-dom';

interface RealSurveillanceMapProps {
  regions: Region[];
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

// Real geographic coordinates mapping for regions around metropolitan surveillance area
export const REGION_COORDINATES: Record<string, [number, number]> = {
  'reg-central': [37.7749, -122.4194],  // Urban Central Core
  'reg-north': [37.8715, -122.2730],    // North District / University corridor
  'reg-west': [37.7337, -122.4746],     // West Valley / Ocean corridor
  'reg-east': [37.8044, -122.1712],     // East Hills
  'reg-south': [37.5485, -122.3186],    // South Bay
  'reg-metro': [37.8272, -122.3789],    // Harbor
  'reg-highland': [37.9056, -122.3477], // Highland Ridge
  'reg-riverdale': [37.6688, -122.0808],// Riverdale
  'reg-pinecreek': [37.5841, -122.3661],// Pine Creek
  'reg-lakeside': [37.7126, -122.1583], // Lakeside Basin
  'reg-suncrest': [37.9358, -122.0598], // Suncrest Valley
  'reg-fairview': [37.6624, -122.4411], // Fairview Plains
};

export const RealSurveillanceMap: React.FC<RealSurveillanceMapProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  height = '420px',
  zoom = 10,
  center = [37.76, -122.32],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.Layer }>({});
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');
  const activeTileLayersRef = useRef<L.Layer[]>([]);
  const navigate = useNavigate();

  // Helper to load tile layers based on style
  const applyTileStyle = (map: L.Map, style: 'dark' | 'satellite') => {
    // Remove previous tile layers
    activeTileLayersRef.current.forEach((l) => map.removeLayer(l));
    activeTileLayersRef.current = [];

    if (style === 'dark') {
      // Esri World Dark Gray Base + Reference (No watermark, dark cartography)
      const base = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &copy; OpenStreetMap',
          maxZoom: 16,
        }
      ).addTo(map);

      const labels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '',
          maxZoom: 16,
        }
      ).addTo(map);

      activeTileLayersRef.current = [base, labels];
    } else {
      // Esri High-Resolution World Imagery Satellite + Boundaries
      const sat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &copy; Maxar, Earthstar Geographics',
          maxZoom: 18,
        }
      ).addTo(map);

      const places = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '',
          maxZoom: 18,
        }
      ).addTo(map);

      activeTileLayersRef.current = [sat, places];
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
      });

      applyTileStyle(map, mapStyle);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Tile Style Switcher
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    applyTileStyle(mapInstanceRef.current, mapStyle);
  }, [mapStyle]);

  // Render Outbreak Risk Markers & Heat Circles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear previous markers
    Object.values(layersRef.current).forEach(layer => map.removeLayer(layer));
    layersRef.current = {};

    regions.forEach(region => {
      const coords = REGION_COORDINATES[region.id] || [37.77, -122.42];

      let fillColor = '#10B981';
      let strokeColor = '#10B981';
      let radius = 1800; // meters

      if (region.riskLevel === 'critical') {
        fillColor = '#EF4444';
        strokeColor = '#EF4444';
        radius = 3500;
      } else if (region.riskLevel === 'high') {
        fillColor = '#F97316';
        strokeColor = '#F97316';
        radius = 2800;
      } else if (region.riskLevel === 'medium') {
        fillColor = '#F59E0B';
        strokeColor = '#F59E0B';
        radius = 2400;
      } else if (region.riskLevel === 'low') {
        fillColor = '#06B6D4';
        strokeColor = '#06B6D4';
        radius = 1900;
      }

      // Outer Heat/Outbreak Circle Zone
      const circle = L.circle(coords, {
        color: strokeColor,
        fillColor,
        fillOpacity: region.riskLevel === 'critical' ? 0.35 : 0.22,
        weight: region.riskLevel === 'critical' ? 3 : 1.5,
        radius,
      }).addTo(map);

      // Inner Pulse Dot
      const marker = L.circleMarker(coords, {
        radius: region.riskLevel === 'critical' ? 9 : 7,
        fillColor,
        color: '#FFFFFF',
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);

      // Interactive Popup with real telemetry
      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="font-size: 14px; color: #FFFFFF;">${region.name}</strong>
            <span style="font-size: 10px; font-family: monospace; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; color: #CBD5E1;">${region.code}</span>
          </div>
          <div style="margin-bottom: 8px;">
            <span style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px; background: ${fillColor}22; color: ${fillColor}; border: 1px solid ${fillColor}44;">
              ${region.riskLevel.toUpperCase()} RISK
            </span>
          </div>
          <div style="font-size: 12px; color: #94A3B8; margin-bottom: 8px;">
            <div>Signal: <strong style="color: #F1F5F9;">${region.keyIndicator}</strong></div>
            <div>Surge: <strong style="color: ${region.changeRate > 0 ? '#EF4444' : '#10B981'}; font-family: monospace;">${region.changeRate > 0 ? '+' : ''}${region.changeRate}%</strong></div>
            <div>Reported Cases: <strong style="color: #F1F5F9;">${region.reportedCases}</strong></div>
          </div>
          <button id="view-region-${region.id}" style="width: 100%; background: #00F0FF; color: #0B0D14; font-weight: 600; font-size: 11px; padding: 6px 10px; border-radius: 8px; border: none; cursor: pointer;">
            Inspect Dossier &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      circle.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-region-${region.id}`);
        if (btn) {
          btn.onclick = () => {
            navigate(`/regions/${region.id}`);
          };
        }
      });

      marker.on('click', () => {
        if (onSelectRegion) onSelectRegion(region.id);
      });

      circle.on('click', () => {
        if (onSelectRegion) onSelectRegion(region.id);
      });

      layersRef.current[`circle_${region.id}`] = circle;
      layersRef.current[`marker_${region.id}`] = marker;
    });
  }, [regions, onSelectRegion, navigate]);

  // Handle programmatic pan when selectedRegionId changes
  useEffect(() => {
    if (!selectedRegionId || !mapInstanceRef.current) return;
    const coords = REGION_COORDINATES[selectedRegionId];
    if (coords) {
      mapInstanceRef.current.flyTo(coords, 12, { duration: 1.2 });
      const marker = layersRef.current[`marker_${selectedRegionId}`] as L.CircleMarker;
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedRegionId]);

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Map Header Toolbar */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
        <div className="bg-[#0F121C]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          <span className="text-white font-semibold">Real-Time Cartographic Feed</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        {/* Layer style toggle */}
        <div className="bg-[#0F121C]/90 backdrop-blur-md p-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs shadow-lg">
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-2.5 py-1 rounded-lg font-mono transition-colors ${
              mapStyle === 'dark' ? 'bg-brand-cyan/20 text-brand-cyan font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark Matter
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 rounded-lg font-mono transition-colors ${
              mapStyle === 'satellite' ? 'bg-brand-violet/20 text-purple-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        <button
          onClick={resetView}
          className="p-2 bg-[#0F121C]/90 backdrop-blur-md hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-white/10 shadow-lg transition-colors"
          title="Reset Map View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#0F121C]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-[11px] font-mono flex items-center gap-4 text-slate-300 shadow-xl">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#EF4444]" /> Critical (+180%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium Risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Low Risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Normal Baseline
        </span>
      </div>
    </div>
  );
};
