# Precision Leaflet GIS & Google Maps Satellite Alignment Plan

Upgrade the GeoThermalEdu Lahendong mapping core from a custom SVG coordinate projection to a production-grade **Leaflet GIS engine**. This eliminates any geographic distortion or placement deviation, aligning real-world Google Maps Satellite tiles with true WGS84 coordinates down to sub-meter accuracy. The initial center is calibrated precisely to **Danau Linow** (`1.2708332°N, 124.8057893°E`), with georeferenced semi-transparent raster overlays for Land Surface Temperature (LST) and NDVI vegetation health, and an instant "Hapus Titik" option for accidental clicks.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following requirements were confirmed during the interactive clarification:
> - **Mapping Core Engine**: Install and configure **Leaflet GIS** (`leaflet`, `@types/leaflet`) to handle standard EPSG:3857 Web Mercator spherical mathematics natively. This guarantees exact tile-to-coordinate registration without any manual projection offset.
> - **Initial Map Center**: Calibrated directly to **Danau Linow** at `[1.2708332, 124.8057893]` with an initial zoom level of 15.5.
> - **Overlay Strategy**: Semi-transparent raster overlay rendered onto a Leaflet custom `Canvas` / `ImageOverlay` layer with real-time opacity slider control, allowing students to observe real satellite imagery of roads, trees, and lake shoreline underneath thermal heat signatures.
> - **Basemap Options**: Dedicated selection between **Google Maps Satelit (Hybrid with labels)** and **Esri Aerial High-Resolution**, with the legacy 'OSM Jalan' option removed.
> - **Waypoint Deletion**: Prominent "Hapus Titik" (Trash action) available immediately upon waypoint selection and inside the ground-check logbook table to easily remove accidentally placed waypoints.

---

## 1. Overview & Core Concept

### What It Does
The updated map system replaces the synthetic SVG coordinate space with a Leaflet-powered GIS viewport. Google Maps Satellite tiles serve as the base layer, displaying true aerial imagery of Kelurahan Lahendong, Lake Linow, and the Mount Lokon geothermal volcanic belt. Interactive markers snap to exact physical coordinates with zero displacement. Geothermal heat anomalies (LST °C) and Sentinel-2 NDVI layers are rendered as georeferenced overlays with adjustable transparency.

### Precise Landmark Coordinates (WGS84)
All reference sites are calibrated to real-world ground positions:
1. **Danau Linow (Center & Shoreline Vents)**: `1.2708332°N, 124.8057893°E`
2. **Kantor Kelurahan Lahendong (Jl. Raya Tomohon, Plus Code: 7RF9+WX6)**: `1.2748800°N, 124.8199500°E`
3. **Hutan Wisata Pinus Lahendong (Ecological Buffer)**: `1.2721000°N, 124.8023000°E`
4. **Kawah Lumpur Kasuratan (Boiling Mud Pools)**: `1.2642000°N, 124.8089000°E`
5. **Fumarol Steaming Vent Sektor Barat**: `1.2615000°N, 124.8078000°E`
6. **Mata Air Panas Ranowangko**: `1.2560000°N, 124.8055000°E`
7. **PLTP Lahendong Unit 5 & 6 (PGE Area Lahendong)**: `1.2535000°N, 124.8235000°E`
8. **Wellpad Geothermal LHD-4 / LHD-23**: `1.2570000°N, 124.8210000°E`

---

## 2. User Experience & Visual Design

### Map Stage Redesign with Leaflet
- **Zero Drift Visual Registration**: Leaflet's tile engine handles all zooming, panning, and inertia smoothly. Google Maps satellite tiles align seamlessly with markers and overlays across all zoom levels (zoom 12 to 18).
- **Interactive Probing**: Moving the cursor across the map triggers `mousemove` events that query the nearest spatial raster cell and display a real-time HUD tooltip with latitude, longitude (to 5 decimal places), elevation, LST (°C), and NDVI index.
- **Click-to-Plot & Delete**: Clicking anywhere on the map drops a temporary fieldwork pin with coordinates. If placed by mistake, clicking "Hapus Titik" immediately removes it from state and clears the selection with a toast notification.
- **Layer Controls**:
  - Basemap Switcher: *Google Maps Satelit* | *Esri Aerial* | *Raster Spektral Murni*
  - Spectral Overlays: *LST Suhu Permukaan (°C)* | *NDVI Kerapatan Vegetasi* | *Color Infrared (CIR)* | *Zonasi Wilayah & Konflik*
  - Opacity Slider: Continuous blending from 0% (pure satellite) to 100% (pure thermal/NDVI layer).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Leaflet GIS Engine vs Hand-Calculated SVG Tiles**
  - *Chosen Approach*: Install `leaflet` and `@types/leaflet`. Mount the map inside a `useRef` container.
  - *Why*: Eliminates spherical Mercator projection distortion completely. Leaflet projects latitude using the exact ellipsoidal formula, ensuring that a coordinate like `1.2708332, 124.8057893` lands exactly in the center of Lake Linow on Google Maps Satellite.
- **Decision 2: High-Performance Canvas Overlay for Thermal/NDVI Raster**
  - *Chosen Approach*: Render raster cells into a georeferenced HTML5 Canvas layer or `L.imageOverlay` generated on-the-fly via off-screen canvas data URL, updated when sliders or spectral modes change.
  - *Why*: Delivers 60fps hardware-accelerated rendering without DOM bloat, while preserving transparency so satellite imagery is crisp.
- **Decision 3: Zero-Dependency Pure Leaflet vs React-Leaflet**
  - *Chosen Approach*: Use pure `leaflet` imperatively inside React `useEffect` hooks.
  - *Why*: Avoids React 19 compatibility warnings and peer-dependency conflicts with `@react-leaflet`, giving complete control over lifecycle, event listeners, and tile destruction.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GeoThermalEdu Lahendong                         │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation: Brand · Module Selectors · Export Report              │
├───────────────────────────────────┬────────────────────────────────────┤
│           LEAFLET GIS STAGE       │          CONTROL & LAB DECK        │
│          (65% Screen Width)       │         (35% Screen Width)         │
│                                   │                                    │
│ ┌───────────────────────────────┐ │ ┌────────────────────────────────┐ │
│ │ Leaflet Map Container         │ │ │ Basemap Switcher:              │ │
│ │ - Base: Google Maps Hybrid /  │ │ │ [Google Satelit] [Esri Aerial] │ │
│ │         Esri Satellite Tiles  │ │ ├────────────────────────────────┤ │
│ │ - Georeferenced Canvas Layer: │ │ │ Spectral Modes:                │ │
│ │   LST Thermal Heatmap / NDVI  │ │ │ [LST] [NDVI] [CIR] [Zoning]    │ │
│ │ - Custom Leaflet Markers:     │ │ ├────────────────────────────────┤ │
│ │   Danau Linow [1.2708, 124.80]│ │ │ Filter Sliders:                │ │
│ │   Kantor Lurah, PLTP, Mud     │ │ │ - Thermal Cutoff (≥ 42°C)      │ │
│ │ - Interactive Click & Probe:  │ │ │ - NDVI Mask Cutoff             │ │
│ │   [Hapus Titik] Quick Action  │ │ │ - Opacity (0% - 100%)          │ │
│ └───────────────────────────────┘ │ ├────────────────────────────────┤ │
│                                   │ │ Waypoint Quick Card & Telemetry│ │
│ Built-in Leaflet Scale & Zoom     │ └────────────────────────────────┘ │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Implementation Steps
1. **Package Installation**: Install `leaflet` and `@types/leaflet`. Import `leaflet/dist/leaflet.css`.
2. **Data Recalibration**: Update `INITIAL_WAYPOINTS` and `LAHENDONG_BOUNDS` in `lahendongData.ts` to match the exact coordinates of Danau Linow (`1.2708332, 124.8057893`) and surrounding landmarks.
3. **Leaflet Component Implementation**: Rebuild `MapStage.tsx` with Leaflet `L.map`, `L.tileLayer` (Google Maps & Esri), georeferenced raster canvas overlay, and custom SVG pin markers.
4. **Delete Waypoint Integration**: Connect `onDeleteWaypoint` to marker click popups, map cards, and the Ground Check table.
5. **Verification**: Run `compile_applet` and test map alignment.
