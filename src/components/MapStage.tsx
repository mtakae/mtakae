import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { 
  SpectralMode, 
  BasemapProvider,
  GridCell, 
  Waypoint, 
  LandCoverType 
} from '../types/gis';
import { 
  LAND_COVER_CLASSES,
  LAHENDONG_BOUNDS 
} from '../data/lahendongData';
import { 
  Globe, 
  Trash2, 
  ExternalLink, 
  Crosshair, 
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation
} from 'lucide-react';

interface MapStageProps {
  spectralMode: SpectralMode;
  basemapProvider: BasemapProvider;
  setBasemapProvider: (b: BasemapProvider) => void;
  cells: GridCell[];
  waypoints: Waypoint[];
  selectedWaypoint: Waypoint | null;
  onSelectWaypoint: (wp: Waypoint | null) => void;
  onDeleteWaypoint: (id: string) => void;
  onEditWaypoint?: (wp: Waypoint) => void;
  onAddWaypointAtCoord?: (cell: GridCell) => void;
  thermalThreshold: number;
  ndviThreshold: number;
  opacity: number;
  showZoningBorders: boolean;
  showContourLines: boolean;
  educationLevel: 'high_school' | 'undergraduate';
  hoveredCell: GridCell | null;
  setHoveredCell: (cell: GridCell | null) => void;
}

export const MapStage: React.FC<MapStageProps> = ({
  spectralMode,
  basemapProvider,
  setBasemapProvider,
  cells,
  waypoints,
  selectedWaypoint,
  onSelectWaypoint,
  onDeleteWaypoint,
  onEditWaypoint,
  onAddWaypointAtCoord,
  thermalThreshold,
  ndviThreshold,
  opacity,
  showZoningBorders,
  showContourLines,
  educationLevel,
  hoveredCell,
  setHoveredCell,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const rasterOverlayRef = useRef<L.ImageOverlay | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const vectorGroupRef = useRef<L.LayerGroup | null>(null);

  const [mouseCoord, setMouseCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isGoogleMapsModalOpen, setIsGoogleMapsModalOpen] = useState(false);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map centered exactly on Danau Linow (1.2708332, 124.8057893)
      const map = L.map(mapContainerRef.current, {
        center: [LAHENDONG_BOUNDS.centerLat, LAHENDONG_BOUNDS.centerLng],
        zoom: 15.5,
        zoomControl: false,
        attributionControl: true,
        maxZoom: 19,
        minZoom: 12,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);
      L.control.scale({ imperial: false, metric: true, position: 'bottomright' }).addTo(map);

      // Layer groups
      markerGroupRef.current = L.layerGroup().addTo(map);
      vectorGroupRef.current = L.layerGroup().addTo(map);

      // Mousemove event for real-time coordinate and cell probe
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setMouseCoord({ lat: e.latlng.lat, lng: e.latlng.lng });

        // Find nearest cell in cells array
        let closestCell: GridCell | null = null;
        let minDistance = Infinity;

        for (let i = 0; i < cells.length; i++) {
          const c = cells[i];
          const dist = Math.hypot(c.lat - e.latlng.lat, c.lng - e.latlng.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestCell = c;
          }
        }

        if (closestCell && minDistance < 0.005) {
          setHoveredCell(closestCell);
        } else {
          setHoveredCell(null);
        }
      });

      // Click to drop / inspect pinpoint waypoint
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onAddWaypointAtCoord) {
          const lat = parseFloat(e.latlng.lat.toFixed(6));
          const lng = parseFloat(e.latlng.lng.toFixed(6));

          // Find approximate LST and NDVI from nearest cell
          let closest = cells[0];
          let minD = Infinity;
          for (let i = 0; i < cells.length; i++) {
            const d = Math.hypot(cells[i].lat - lat, cells[i].lng - lng);
            if (d < minD) {
              minD = d;
              closest = cells[i];
            }
          }

          const dynamicCell: GridCell = {
            ...closest,
            lat,
            lng,
          };
          onAddWaypointAtCoord(dynamicCell);
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Manage Base Tile Layer (Google Satellite vs Esri vs Pure Raster)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    if (basemapProvider === 'google_satellite') {
      // Google Satellite Hybrid (satellite + roads + place labels)
      tileLayerRef.current = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps Satelit &bull; Lahendong WGS84',
      }).addTo(map);
    } else if (basemapProvider === 'esri_satellite') {
      // Esri World Imagery (High-Resolution Aerial Orthophoto)
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: '&copy; Esri World Imagery &bull; Tomohon Geothermal',
        }
      ).addTo(map);
    }
  }, [basemapProvider]);

  // 3. Generate and Update Georeferenced Analytical Raster Overlay (LST, NDVI, CIR, etc.)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Create offscreen canvas 400x400 to generate smooth interpolated raster image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 40;
    const cellW = canvas.width / gridSize;
    const cellH = canvas.height / gridSize;

    const hasRealBasemap = basemapProvider !== 'synthetic_raster';

    cells.forEach((cell) => {
      // If thermal threshold is active, filter out non-anomalies
      if (thermalThreshold > 20 && cell.lst < thermalThreshold) {
        return;
      }

      // If NDVI mask is active, filter out low NDVI
      if (ndviThreshold > -0.5 && cell.ndvi < ndviThreshold) {
        return;
      }

      let fill = 'transparent';

      switch (spectralMode) {
        case 'true_color':
          if (hasRealBasemap) {
            switch (cell.landCover) {
              case 'lake_water':
                fill = 'rgba(8, 145, 178, 0.45)';
                break;
              case 'protection_forest':
                fill = 'rgba(20, 83, 45, 0.35)';
                break;
              case 'geothermal_manifestation':
                fill = 'rgba(239, 68, 68, 0.65)';
                break;
              default:
                fill = 'rgba(51, 65, 85, 0.25)';
            }
          } else {
            switch (cell.landCover) {
              case 'lake_water':
                fill = '#0891b2';
                break;
              case 'protection_forest':
                fill = '#14532d';
                break;
              case 'mixed_agriculture':
                fill = '#4d7c0f';
                break;
              case 'pltp_infrastructure':
                fill = '#64748b';
                break;
              case 'geothermal_manifestation':
                fill = '#a8a29e';
                break;
              case 'residential_settlement':
                fill = '#94a3b8';
                break;
              default:
                fill = '#1e293b';
            }
          }
          break;

        case 'cir':
          switch (cell.landCover) {
            case 'protection_forest':
              fill = hasRealBasemap ? 'rgba(190, 18, 60, 0.65)' : '#be123c';
              break;
            case 'mixed_agriculture':
              fill = hasRealBasemap ? 'rgba(244, 63, 94, 0.55)' : '#f43f5e';
              break;
            case 'lake_water':
              fill = hasRealBasemap ? 'rgba(9, 13, 22, 0.75)' : '#090d16';
              break;
            case 'pltp_infrastructure':
              fill = hasRealBasemap ? 'rgba(56, 189, 248, 0.6)' : '#38bdf8';
              break;
            case 'geothermal_manifestation':
              fill = hasRealBasemap ? 'rgba(255, 255, 255, 0.8)' : '#e0e7ff';
              break;
            case 'residential_settlement':
              fill = hasRealBasemap ? 'rgba(125, 211, 252, 0.55)' : '#7dd3fc';
              break;
            default:
              fill = '#0f172a';
          }
          break;

        case 'ndvi': {
          const val = cell.ndvi;
          if (hasRealBasemap) {
            if (val < -0.1) fill = 'rgba(2, 132, 199, 0.65)';
            else if (val < 0.15) fill = 'rgba(217, 119, 6, 0.75)';
            else if (val < 0.35) fill = 'rgba(234, 179, 8, 0.6)';
            else if (val < 0.55) fill = 'rgba(132, 204, 22, 0.6)';
            else if (val < 0.75) fill = 'rgba(22, 163, 74, 0.7)';
            else fill = 'rgba(21, 128, 61, 0.8)';
          } else {
            if (val < -0.1) fill = '#0284c7';
            else if (val < 0.15) fill = '#d97706';
            else if (val < 0.35) fill = '#eab308';
            else if (val < 0.55) fill = '#84cc16';
            else if (val < 0.75) fill = '#16a34a';
            else fill = '#15803d';
          }
          break;
        }

        case 'lst': {
          const t = cell.lst;
          if (hasRealBasemap) {
            if (t < 25) fill = 'rgba(37, 99, 235, 0.25)';
            else if (t < 30) fill = 'rgba(6, 182, 212, 0.35)';
            else if (t < 36) fill = 'rgba(16, 185, 129, 0.45)';
            else if (t < 44) fill = 'rgba(245, 158, 11, 0.65)';
            else if (t < 55) fill = 'rgba(249, 115, 22, 0.8)';
            else if (t < 75) fill = 'rgba(239, 68, 68, 0.9)';
            else fill = 'rgba(220, 38, 38, 0.95)';
          } else {
            if (t < 24) fill = '#2563eb';
            else if (t < 28) fill = '#06b6d4';
            else if (t < 34) fill = '#10b981';
            else if (t < 42) fill = '#f59e0b';
            else if (t < 55) fill = '#f97316';
            else if (t < 75) fill = '#ef4444';
            else fill = '#dc2626';
          }
          break;
        }

        case 'zoning': {
          const base = LAND_COVER_CLASSES.find((c) => c.id === cell.landCover);
          if (base) {
            fill = hasRealBasemap ? `${base.color}88` : base.color;
          }
          break;
        }
      }

      ctx.fillStyle = fill;
      ctx.fillRect(cell.x * cellW, cell.y * cellH, cellW, cellH);
    });

    const dataUrl = canvas.toDataURL();
    const rasterBounds: L.LatLngBoundsExpression = [
      [LAHENDONG_BOUNDS.minLat, LAHENDONG_BOUNDS.minLng],
      [LAHENDONG_BOUNDS.maxLat, LAHENDONG_BOUNDS.maxLng],
    ];

    if (rasterOverlayRef.current) {
      rasterOverlayRef.current.setUrl(dataUrl);
      rasterOverlayRef.current.setOpacity(opacity);
    } else {
      rasterOverlayRef.current = L.imageOverlay(dataUrl, rasterBounds, {
        opacity,
        interactive: false,
      }).addTo(map);
    }
  }, [cells, spectralMode, thermalThreshold, ndviThreshold, opacity, basemapProvider]);

  // 4. Update Leaflet Waypoint Markers with Zero Displacement
  useEffect(() => {
    const markerGroup = markerGroupRef.current;
    if (!markerGroup) return;

    markerGroup.clearLayers();

    waypoints.forEach((wp) => {
      const isSelected = selectedWaypoint?.id === wp.id;

      const icon = L.divIcon({
        className: 'custom-wp-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${wp.sensorAnomaly ? '<div class="absolute w-7 h-7 rounded-full bg-red-500/40 animate-ping"></div>' : ''}
            <div class="w-6 h-6 rounded-full ${isSelected ? 'bg-orange-500 ring-2 ring-white scale-110' : 'bg-slate-900 border-2 border-white'} shadow-lg flex items-center justify-center text-[10px] font-bold text-white transition-transform">
              ${wp.id.replace('WP-', '')}
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-950/90 text-[10px] text-white font-mono border border-slate-700 shadow pointer-events-none">
              ${wp.id}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([wp.lat, wp.lng], { icon });

      // Click listener
      marker.on('click', () => {
        onSelectWaypoint(wp);
      });

      // Bind detailed popup with "Hapus Titik"
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-xs space-y-1.5';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between pb-1 border-b border-slate-700">
          <span class="font-bold font-mono text-orange-400">${wp.id}</span>
          <span class="font-bold text-white">${wp.tempCelsius}°C</span>
        </div>
        <h4 class="font-bold text-slate-100 text-[11px] leading-snug">${wp.name}</h4>
        <div class="font-mono text-[10px] text-slate-400">
          Lat: ${wp.lat.toFixed(6)}°N<br/>
          Lng: ${wp.lng.toFixed(6)}°E
        </div>
        <p class="text-[10px] text-slate-300 line-clamp-2">${wp.description}</p>
      `;

      const btnRow = document.createElement('div');
      btnRow.className = 'grid grid-cols-2 gap-1.5 mt-2';

      if (onEditWaypoint) {
        const editBtn = document.createElement('button');
        editBtn.className = 'py-1 px-2 text-[10px] font-semibold text-orange-300 bg-orange-950/70 hover:bg-orange-900/90 border border-orange-800 rounded flex items-center justify-center gap-1 transition-colors';
        editBtn.innerHTML = `<span>✏️ Edit Lokasi</span>`;
        editBtn.onclick = () => {
          onEditWaypoint(wp);
          marker.closePopup();
        };
        btnRow.appendChild(editBtn);
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'py-1 px-2 text-[10px] font-semibold text-red-300 bg-red-950/70 hover:bg-red-900/90 border border-red-800 rounded flex items-center justify-center gap-1 transition-colors';
      deleteBtn.innerHTML = `<span>🗑️ Hapus</span>`;
      deleteBtn.onclick = () => {
        onDeleteWaypoint(wp.id);
        marker.closePopup();
      };
      btnRow.appendChild(deleteBtn);

      popupContent.appendChild(btnRow);
      marker.bindPopup(popupContent);

      markerGroup.addLayer(marker);
    });
  }, [waypoints, selectedWaypoint, onDeleteWaypoint, onEditWaypoint, onSelectWaypoint]);

  // 5. Update Cadastral & Zoning Vector Polygons
  useEffect(() => {
    const vectorGroup = vectorGroupRef.current;
    if (!vectorGroup) return;

    vectorGroup.clearLayers();

    if (spectralMode === 'zoning') {
      // 1. Danau Linow Conservation Perimeter: Center [1.271100, 124.826400]
      const linowCircle = L.circle([1.271100, 124.826400], {
        radius: 350,
        color: '#06b6d4',
        weight: 2,
        fillColor: '#06b6d4',
        fillOpacity: 0.15,
      }).bindTooltip('Buffer Konservasi Danau Linow (Radius 350m)', { sticky: true });
      vectorGroup.addLayer(linowCircle);

      // 2. WKP Geothermal Concession (PLTP Lahendong PGE)
      const wkpPolygon = L.polygon(
        [
          [1.2650, 124.8080],
          [1.2700, 124.8250],
          [1.2510, 124.8270],
          [1.2505, 124.8050],
        ],
        {
          color: '#f97316',
          dashArray: '6, 6',
          weight: 2,
          fillColor: '#f97316',
          fillOpacity: 0.12,
        }
      ).bindTooltip('Wilayah Kerja Panas Bumi (WKP) PGE Lahendong', { sticky: true });
      vectorGroup.addLayer(wkpPolygon);

      // 3. Protected Pine Forest Buffer (Hutan Lindung Kasuratan & Barat)
      const forestPolygon = L.polygon(
        [
          [1.2800, 124.7980],
          [1.2800, 124.8100],
          [1.2660, 124.8040],
          [1.2550, 124.7980],
        ],
        {
          color: '#10b981',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.12,
        }
      ).bindTooltip('Kawasan Hutan Lindung & Wisata Pinus', { sticky: true });
      vectorGroup.addLayer(forestPolygon);

      // 4. Kelurahan Lahendong Residential & Administrative Corridor (Jl. Raya Tomohon)
      const villagePolygon = L.polygon(
        [
          [1.2790, 124.8140],
          [1.2790, 124.8260],
          [1.2680, 124.8260],
          [1.2700, 124.8150],
        ],
        {
          color: '#8b5cf6',
          weight: 2,
          fillColor: '#8b5cf6',
          fillOpacity: 0.12,
        }
      ).bindTooltip('Batas Permukiman Kelurahan Lahendong (Jl. Raya Tomohon)', { sticky: true });
      vectorGroup.addLayer(villagePolygon);
    }
  }, [spectralMode]);

  // Quick action: Center directly to Danau Linow
  const handleRecenterDanauLinow = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([1.271100, 124.826400], 16, { duration: 1.2 });
    }
  };

  // Quick action: Center to Kantor Kelurahan
  const handleRecenterKantorLurah = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([1.2748800, 124.8199500], 16, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden border border-slate-800 rounded-lg">
      {/* Top Map Context & Basemap Switcher Ribbon (Without OSM Jalan) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900/95 border-b border-slate-800 text-xs text-slate-300 z-10">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-semibold text-white tracking-wide">
            Peta Dasar:
          </span>
          <div className="flex items-center bg-slate-950 rounded p-0.5 border border-slate-800 text-[11px]">
            <button
              onClick={() => setBasemapProvider('google_satellite')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                basemapProvider === 'google_satellite'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Maps Satelit
            </button>
            <button
              onClick={() => setBasemapProvider('esri_satellite')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                basemapProvider === 'esri_satellite'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Esri Aerial
            </button>
            <button
              onClick={() => setBasemapProvider('synthetic_raster')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                basemapProvider === 'synthetic_raster'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Raster Murni
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Centering Buttons */}
          <button
            onClick={handleRecenterDanauLinow}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/60 rounded transition-colors"
            title="Pusatkan peta ke Danau Linow (1.271100, 124.826400)"
          >
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span>Fokus Danau Linow</span>
          </button>

          <button
            onClick={handleRecenterKantorLurah}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors hidden sm:flex"
            title="Pusatkan peta ke Kantor Lurah Lahendong"
          >
            <span>Kantor Lurah</span>
          </button>

          <button
            onClick={() => setIsGoogleMapsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-orange-300 bg-orange-950/60 hover:bg-orange-900/80 border border-orange-800/60 rounded transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Google Maps</span>
            <span className="sm:hidden">GMaps</span>
          </button>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* Selected Waypoint Floating Card with "Edit Titik" and "Hapus Titik" */}
        {selectedWaypoint && (
          <div className="absolute top-4 left-4 z-20 p-3 bg-slate-900/95 border border-orange-500/80 rounded-lg shadow-2xl backdrop-blur-md max-w-xs text-xs text-slate-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-mono text-orange-400 font-bold">
                {selectedWaypoint.id} · {selectedWaypoint.tempCelsius}°C
              </span>
              <div className="flex items-center gap-1">
                {onEditWaypoint && (
                  <button
                    onClick={() => onEditWaypoint(selectedWaypoint)}
                    className="flex items-center gap-1 text-[11px] text-orange-300 hover:text-white hover:bg-orange-950/60 px-1.5 py-0.5 rounded transition-colors font-medium"
                    title="Edit titik lokasi ini"
                  >
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={() => onDeleteWaypoint(selectedWaypoint.id)}
                  className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-950/60 px-1.5 py-0.5 rounded transition-colors font-medium"
                  title="Hapus titik yang tidak sengaja terbuat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
            <h4 className="font-bold text-white text-xs pt-1">
              {selectedWaypoint.name}
            </h4>
            <p className="text-[11px] font-mono text-slate-400 pt-0.5">
              Lat: {selectedWaypoint.lat.toFixed(6)}°N<br />
              Lng: {selectedWaypoint.lng.toFixed(6)}°E
            </p>
          </div>
        )}

        {/* Real-time Hover Crosshair Tooltip */}
        {hoveredCell && mouseCoord && (
          <div className="absolute top-4 right-14 z-20 p-2.5 bg-slate-900/95 border border-slate-700 rounded-md shadow-xl backdrop-blur-sm text-xs w-60 text-slate-200 pointer-events-none">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 font-mono text-[11px]">
              <span className="text-orange-400 font-bold">
                {mouseCoord.lat.toFixed(6)}°N
              </span>
              <span className="text-slate-400">
                {mouseCoord.lng.toFixed(6)}°E
              </span>
            </div>

            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Suhu Permukaan (LST):</span>
                <span className={`font-mono font-semibold ${hoveredCell.lst > 45 ? 'text-red-400' : 'text-slate-200'}`}>
                  {hoveredCell.lst}°C
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Indeks NDVI:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {hoveredCell.ndvi}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Klasifikasi:</span>
                <span className="font-medium text-white truncate max-w-[130px]">
                  {LAND_COVER_CLASSES.find((c) => c.id === hoveredCell.landCover)?.name || hoveredCell.landCover}
                </span>
              </div>

              {hoveredCell.isZoningConflict && (
                <div className="flex items-center gap-1.5 pt-1 text-amber-400 font-semibold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Potensi Tumpang Tindih Wilayah</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Cartographic Legend (Bottom Left) */}
        <div className="absolute bottom-6 left-4 z-20 bg-slate-900/90 p-3 rounded-lg border border-slate-800 shadow-lg text-xs max-w-xs">
          <div className="font-semibold text-white pb-1 mb-1 border-b border-slate-800 flex items-center justify-between">
            <span>
              {spectralMode === 'true_color' && 'Sentinel-2 RGB Natural'}
              {spectralMode === 'cir' && 'Sentinel-2 CIR (Inframerah 8-4-3)'}
              {spectralMode === 'ndvi' && 'Indeks Kerapatan Vegetasi (NDVI)'}
              {spectralMode === 'lst' && 'Landsat TIRS LST (°C Radiasi)'}
              {spectralMode === 'zoning' && 'Peta Tata Ruang & Batas Wilayah'}
            </span>
          </div>

          {/* Legend Items */}
          {spectralMode === 'lst' && (
            <div className="space-y-1.5">
              <div className="h-2.5 w-full rounded bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 via-amber-400 to-red-600" />
              <div className="flex justify-between font-mono text-[10px] text-slate-400">
                <span>20°C (Ambient)</span>
                <span>40°C</span>
                <span>&gt;85°C (Fumarol)</span>
              </div>
            </div>
          )}

          {spectralMode === 'ndvi' && (
            <div className="space-y-1.5">
              <div className="h-2.5 w-full rounded bg-gradient-to-r from-cyan-600 via-amber-600 via-lime-500 to-emerald-700" />
              <div className="flex justify-between font-mono text-[10px] text-slate-400">
                <span>-0.3 (Air/Kawah)</span>
                <span>0.2 (Gersang)</span>
                <span>0.85 (Hutan Lebat)</span>
              </div>
            </div>
          )}

          {(spectralMode === 'true_color' || spectralMode === 'cir' || spectralMode === 'zoning') && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              {LAND_COVER_CLASSES.map((cls) => (
                <div key={cls.id} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="truncate text-slate-300" title={cls.name}>
                    {cls.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Google Maps Interactive Modal Window */}
      {isGoogleMapsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[80vh] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-800 border-b border-slate-700 text-white">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold">
                  Google Maps Satelit: Danau Linow (1.271100, 124.826400)
                </h3>
              </div>
              <button
                onClick={() => setIsGoogleMapsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded hover:bg-slate-700"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="flex-1 w-full bg-slate-950 relative">
              <iframe
                title="Google Maps Danau Linow Lahendong"
                src="https://maps.google.com/maps?q=1.271100,124.826400&t=k&z=16&output=embed"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>
                Koordinat Presisi: 1.271100°N, 124.826400°E · Lokasi: Danau Linow, Lahendong, Tomohon Selatan
              </span>
              <a
                href="https://www.google.com/maps?q=1.271100,124.826400"
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Buka di Google Maps Eksternal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
