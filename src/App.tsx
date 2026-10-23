import React, { useState } from 'react';
import { 
  SpectralMode, 
  BasemapProvider,
  EducationLevel, 
  GridCell, 
  Waypoint 
} from './types/gis';
import { 
  generateLahendongRasterGrid, 
  INITIAL_WAYPOINTS,
  latLngToGridPercent 
} from './data/lahendongData';
import { Navbar } from './components/Navbar';
import { MapStage } from './components/MapStage';
import { MapControls } from './components/MapControls';
import { GroundCheckStation } from './components/GroundCheckStation';
import { KnowledgeQuizModal } from './components/KnowledgeQuizModal';
import { ReportModal } from './components/ReportModal';
import { ProposalReferenceDrawer } from './components/ProposalReferenceDrawer';
import { 
  Flame, 
  Layers, 
  Compass, 
  GraduationCap, 
  FileText, 
  MapPin, 
  Thermometer, 
  Trees, 
  AlertTriangle,
  Info,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'groundcheck' | 'quiz' | 'report'>('explorer');
  const [spectralMode, setSpectralMode] = useState<SpectralMode>('lst');
  const [basemapProvider, setBasemapProvider] = useState<BasemapProvider>('google_satellite');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('undergraduate');
  
  // GIS Sliders & Toggles (defaults to 65% opacity when satellite map is active so it shows through)
  const [thermalThreshold, setThermalThreshold] = useState<number>(20);
  const [ndviThreshold, setNdviThreshold] = useState<number>(-0.5);
  const [opacity, setOpacity] = useState<number>(0.65);
  const [showZoningBorders, setShowZoningBorders] = useState<boolean>(true);
  const [showContourLines, setShowContourLines] = useState<boolean>(true);

  // Raster & Waypoint data
  const [cells] = useState<GridCell[]>(() => generateLahendongRasterGrid());
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(INITIAL_WAYPOINTS[0]);
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Assessment & Modals
  const [preTestScore, setPreTestScore] = useState<number | undefined>(undefined);
  const [postTestScore, setPostTestScore] = useState<number | undefined>(undefined);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isProposalOpen, setIsProposalOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [groundCheckEditMode, setGroundCheckEditMode] = useState<boolean>(false);

  // Handlers
  const handleUpdateWaypointNotes = (id: string, notes: string) => {
    setWaypoints((prev) =>
      prev.map((wp) => (wp.id === id ? { ...wp, studentNotes: notes } : wp))
    );
  };

  const handleUpdateWaypoint = (updatedWp: Waypoint) => {
    setWaypoints((prev) =>
      prev.map((wp) => (wp.id === updatedWp.id ? updatedWp : wp))
    );
    setSelectedWaypoint(updatedWp);
    setToastMessage(`Koordinat dan data titik ${updatedWp.id} (${updatedWp.name}) berhasil disesuaikan.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEditFromMap = (wp: Waypoint) => {
    setSelectedWaypoint(wp);
    setGroundCheckEditMode(true);
    setActiveTab('groundcheck');
  };

  const handleDeleteWaypoint = (id: string) => {
    const target = waypoints.find((w) => w.id === id);
    setWaypoints((prev) => prev.filter((wp) => wp.id !== id));
    if (selectedWaypoint?.id === id) {
      const remaining = waypoints.filter((wp) => wp.id !== id);
      setSelectedWaypoint(remaining.length > 0 ? remaining[0] : null);
    }
    setToastMessage(`Titik ${target ? `${target.id} (${target.name})` : id} berhasil dihapus.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCustomWaypoint = (newWp: Waypoint) => {
    setWaypoints((prev) => [newWp, ...prev]);
    setSelectedWaypoint(newWp);
    setToastMessage(`Titik ${newWp.id} berhasil ditambahkan ke peta.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddWaypointFromMap = (cell: GridCell) => {
    const lat = cell.lat;
    const lng = cell.lng;
    const { gridX, gridY } = latLngToGridPercent(lat, lng);

    const newWp: Waypoint = {
      id: `WP-${String(waypoints.length + 1).padStart(2, '0')}`,
      name: `Stasiun Lapangan (${cell.lst}°C)`,
      category: cell.lst > 50 ? 'fumarole' : cell.lst > 35 ? 'mud_pool' : 'forest_buffer',
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      gridX,
      gridY,
      tempCelsius: cell.lst,
      elevationM: cell.elevation,
      ndvi: cell.ndvi,
      hazardNote: cell.lst > 45 ? 'Kawasan panas bumi aktif. Wajib masker & perhatikan rekahan uap.' : 'Kondisi aman terkendali.',
      description: `Titik survei hasil plot langsung pada koordinat presisi (${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E).`,
      scientificContext: 'Data verifikasi lapangan untuk kalibrasi citra satelit.',
      isFieldVerified: true,
      studentNotes: 'Titik diplot melalui interaksi peta praktikum.',
      sensorAnomaly: cell.lst >= 42.0,
    };

    setWaypoints((prev) => [newWp, ...prev]);
    setSelectedWaypoint(newWp);
    setToastMessage(`Titik baru ${newWp.id} dibuat pada ${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-orange-500 text-white text-xs rounded-lg shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3-Zone Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'quiz') {
            setIsQuizOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenProposalModal={() => setIsProposalOpen(true)}
        educationLevel={educationLevel}
        setEducationLevel={setEducationLevel}
      />

      {/* Main App Workspace */}
      <main className="flex-1 p-4 max-w-7xl w-full mx-auto flex flex-col gap-4">
        {/* Quick Informational Notice on Educational Translation */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Studi Kasus:</span>
            <span>PLTP Lahendong &amp; Danau Linow, Tomohon Selatan</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">
              Transformasi Usulan PKM_K2 UNSRAT (Maret 2026) menjadi Media Pembelajaran Geospasial Interaktif
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQuizOpen(true)}
              className="text-orange-400 hover:text-orange-300 font-medium underline flex items-center gap-1"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>
                {preTestScore === undefined ? 'Mulai Pre-Test' : `Skor: ${preTestScore}%`}
              </span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsProposalOpen(true)}
              className="text-slate-400 hover:text-white flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Info Proposal</span>
            </button>
          </div>
        </div>

        {/* Dynamic Views: Map Explorer vs Virtual Ground Check */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
            {/* Left Stage: 65% Interactive GIS Map (8 of 12 cols) */}
            <div className="lg:col-span-8 min-h-[540px] flex flex-col">
              <MapStage
                spectralMode={spectralMode}
                basemapProvider={basemapProvider}
                setBasemapProvider={setBasemapProvider}
                cells={cells}
                waypoints={waypoints}
                selectedWaypoint={selectedWaypoint}
                onSelectWaypoint={setSelectedWaypoint}
                onDeleteWaypoint={handleDeleteWaypoint}
                onEditWaypoint={handleEditFromMap}
                onAddWaypointAtCoord={handleAddWaypointFromMap}
                thermalThreshold={thermalThreshold}
                ndviThreshold={ndviThreshold}
                opacity={opacity}
                showZoningBorders={showZoningBorders}
                showContourLines={showContourLines}
                educationLevel={educationLevel}
                hoveredCell={hoveredCell}
                setHoveredCell={setHoveredCell}
              />
            </div>

            {/* Right Deck: 35% Analytical Controls (4 of 12 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <MapControls
                spectralMode={spectralMode}
                setSpectralMode={setSpectralMode}
                thermalThreshold={thermalThreshold}
                setThermalThreshold={setThermalThreshold}
                ndviThreshold={ndviThreshold}
                setNdviThreshold={setNdviThreshold}
                opacity={opacity}
                setOpacity={setOpacity}
                showZoningBorders={showZoningBorders}
                setShowZoningBorders={setShowZoningBorders}
                showContourLines={showContourLines}
                setShowContourLines={setShowContourLines}
                educationLevel={educationLevel}
                cells={cells}
              />

              {/* Waypoint Quick Card with prominent "Edit Titik" and "Hapus Titik" */}
              {selectedWaypoint && (
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                      Titik Terpilih: {selectedWaypoint.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditFromMap(selectedWaypoint)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-orange-300 hover:text-white hover:bg-orange-950/60 border border-orange-700/60 rounded transition-colors"
                        title="Edit koordinat titik lokasi ini"
                      >
                        <span>Edit Titik</span>
                      </button>
                      <button
                        onClick={() => handleDeleteWaypoint(selectedWaypoint.id)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-950/60 border border-red-900/60 rounded transition-colors"
                        title="Hapus titik yang tidak sengaja terbuat"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-xs">
                    {selectedWaypoint.name}
                  </h4>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
                    <span className="text-red-400 font-semibold">{selectedWaypoint.tempCelsius}°C</span>
                    <span>·</span>
                    <span>{selectedWaypoint.elevationM}m</span>
                    <span>·</span>
                    <span className="text-emerald-400">NDVI {selectedWaypoint.ndvi}</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    WGS84: {selectedWaypoint.lat.toFixed(6)}°N, {selectedWaypoint.lng.toFixed(6)}°E
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {selectedWaypoint.studentNotes || selectedWaypoint.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'groundcheck' && (
          <div className="flex-1 min-h-[600px]">
            <GroundCheckStation
              waypoints={waypoints}
              selectedWaypoint={selectedWaypoint}
              onSelectWaypoint={setSelectedWaypoint}
              onDeleteWaypoint={handleDeleteWaypoint}
              onUpdateWaypointNotes={handleUpdateWaypointNotes}
              onUpdateWaypoint={handleUpdateWaypoint}
              onAddCustomWaypoint={handleAddCustomWaypoint}
              hoveredCell={hoveredCell}
              initialEditMode={groundCheckEditMode}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto py-4 px-6 border-t border-slate-900 bg-slate-950 text-slate-500 text-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>GeoThermalEdu Lahendong · FMIPA Universitas Sam Ratulangi (UNSRAT)</span>
          <span>·</span>
          <span>Program Kemitraan Masyarakat Klaster 2 (PKM_K2)</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsProposalOpen(true)}
            className="hover:text-slate-300 transition-colors"
          >
            Tentang Usulan PKM
          </button>
          <span>·</span>
          <button
            onClick={() => setIsQuizOpen(true)}
            className="hover:text-slate-300 transition-colors"
          >
            Instrumen Pre/Post Test
          </button>
          <span>·</span>
          <button
            onClick={() => setIsReportOpen(true)}
            className="text-orange-400 hover:text-orange-300 font-semibold"
          >
            Cetak Laporan Praktikum
          </button>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <KnowledgeQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        preTestScore={preTestScore}
        setPreTestScore={setPreTestScore}
        postTestScore={postTestScore}
        setPostTestScore={setPostTestScore}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        waypoints={waypoints}
        cells={cells}
        preTestScore={preTestScore}
        postTestScore={postTestScore}
      />

      <ProposalReferenceDrawer
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
      />
    </div>
  );
}
