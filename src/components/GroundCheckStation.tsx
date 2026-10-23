import React, { useState, useEffect } from 'react';
import { Waypoint, GridCell } from '../types/gis';
import { latLngToGridPercent } from '../data/lahendongData';
import { 
  Compass, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Save, 
  Trash2,
  Pencil,
  RotateCcw,
  Crosshair,
  X,
  FileCheck
} from 'lucide-react';

interface GroundCheckStationProps {
  waypoints: Waypoint[];
  selectedWaypoint: Waypoint | null;
  onSelectWaypoint: (wp: Waypoint | null) => void;
  onDeleteWaypoint: (id: string) => void;
  onUpdateWaypointNotes: (id: string, notes: string) => void;
  onUpdateWaypoint: (updatedWp: Waypoint) => void;
  onAddCustomWaypoint: (newWp: Waypoint) => void;
  hoveredCell: GridCell | null;
  initialEditMode?: boolean;
}

export const GroundCheckStation: React.FC<GroundCheckStationProps> = ({
  waypoints,
  selectedWaypoint,
  onSelectWaypoint,
  onDeleteWaypoint,
  onUpdateWaypointNotes,
  onUpdateWaypoint,
  onAddCustomWaypoint,
  hoveredCell,
  initialEditMode = false,
}) => {
  const currentWp = selectedWaypoint || waypoints[0];

  const [editedNotes, setEditedNotes] = useState<string>('');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(initialEditMode);

  // Form states for creating new waypoint
  const [newWpName, setNewWpName] = useState('');
  const [newWpDesc, setNewWpDesc] = useState('');

  // Form states for Editing selected waypoint location & parameters
  const [editForm, setEditForm] = useState<{
    name: string;
    category: Waypoint['category'];
    lat: string;
    lng: string;
    tempCelsius: string;
    elevationM: string;
    ndvi: string;
    hazardNote: string;
    description: string;
    scientificContext: string;
    studentNotes: string;
  }>({
    name: '',
    category: 'lake',
    lat: '',
    lng: '',
    tempCelsius: '',
    elevationM: '',
    ndvi: '',
    hazardNote: '',
    description: '',
    scientificContext: '',
    studentNotes: '',
  });

  // Sync edit form whenever current selected waypoint changes
  useEffect(() => {
    if (currentWp) {
      setEditedNotes(currentWp.studentNotes || '');
      setEditForm({
        name: currentWp.name,
        category: currentWp.category,
        lat: currentWp.lat.toFixed(6),
        lng: currentWp.lng.toFixed(6),
        tempCelsius: currentWp.tempCelsius.toString(),
        elevationM: currentWp.elevationM.toString(),
        ndvi: currentWp.ndvi.toString(),
        hazardNote: currentWp.hazardNote,
        description: currentWp.description,
        scientificContext: currentWp.scientificContext,
        studentNotes: currentWp.studentNotes || '',
      });
    }
  }, [currentWp]);

  const handleSelect = (wp: Waypoint) => {
    onSelectWaypoint(wp);
    setIsEditingLocation(false);
    setEditedNotes(wp.studentNotes || '');
  };

  const handleStartEdit = (wp?: Waypoint) => {
    const target = wp || currentWp;
    if (target) {
      if (wp && wp.id !== currentWp?.id) {
        onSelectWaypoint(wp);
      }
      setEditForm({
        name: target.name,
        category: target.category,
        lat: target.lat.toFixed(6),
        lng: target.lng.toFixed(6),
        tempCelsius: target.tempCelsius.toString(),
        elevationM: target.elevationM.toString(),
        ndvi: target.ndvi.toString(),
        hazardNote: target.hazardNote,
        description: target.description,
        scientificContext: target.scientificContext,
        studentNotes: target.studentNotes || '',
      });
      setIsEditingLocation(true);
      setIsAddingNew(false);
    }
  };

  const handleSaveLocationEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWp) return;

    const parsedLat = parseFloat(editForm.lat);
    const parsedLng = parseFloat(editForm.lng);
    const parsedTemp = parseFloat(editForm.tempCelsius) || 25.0;
    const parsedElev = parseInt(editForm.elevationM, 10) || 800;
    const parsedNdvi = parseFloat(editForm.ndvi) || 0.3;

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      alert('Koordinat Latitude dan Longitude harus berupa angka yang valid.');
      return;
    }

    const { gridX, gridY } = latLngToGridPercent(parsedLat, parsedLng);

    const updated: Waypoint = {
      ...currentWp,
      name: editForm.name.trim() || currentWp.name,
      category: editForm.category,
      lat: parseFloat(parsedLat.toFixed(7)),
      lng: parseFloat(parsedLng.toFixed(7)),
      gridX,
      gridY,
      tempCelsius: parsedTemp,
      elevationM: parsedElev,
      ndvi: parsedNdvi,
      hazardNote: editForm.hazardNote.trim(),
      description: editForm.description.trim(),
      scientificContext: editForm.scientificContext.trim(),
      studentNotes: editForm.studentNotes.trim(),
      sensorAnomaly: parsedTemp >= 42.0,
      isFieldVerified: true,
    };

    onUpdateWaypoint(updated);
    setIsEditingLocation(false);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleUseCursorCoordForEdit = () => {
    if (hoveredCell) {
      setEditForm((prev) => ({
        ...prev,
        lat: hoveredCell.lat.toFixed(6),
        lng: hoveredCell.lng.toFixed(6),
        tempCelsius: hoveredCell.lst.toString(),
        elevationM: hoveredCell.elevation.toString(),
        ndvi: hoveredCell.ndvi.toString(),
      }));
    }
  };

  const handleSaveNotes = () => {
    if (currentWp) {
      onUpdateWaypointNotes(currentWp.id, editedNotes);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2000);
    }
  };

  const handleCreateWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWpName) return;

    const lat = hoveredCell ? hoveredCell.lat : 1.271100;
    const lng = hoveredCell ? hoveredCell.lng : 124.826400;
    const { gridX, gridY } = latLngToGridPercent(lat, lng);
    const temp = hoveredCell ? hoveredCell.lst : 32.5;

    const newWp: Waypoint = {
      id: `WP-${String(waypoints.length + 1).padStart(2, '0')}`,
      name: newWpName,
      category: temp > 50 ? 'fumarole' : temp > 35 ? 'mud_pool' : 'forest_buffer',
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      gridX,
      gridY,
      tempCelsius: temp,
      elevationM: hoveredCell ? hoveredCell.elevation : 820,
      ndvi: hoveredCell ? hoveredCell.ndvi : 0.45,
      hazardNote: temp > 45 ? 'Kawasan panas bumi aktif. Wajib APD masker gas.' : 'Kondisi aman terkendali.',
      description: newWpDesc || 'Titik pengamatan lapangan hasil pemetaan partisipatif.',
      scientificContext: 'Data verifikasi lapangan untuk kalibrasi citra satelit.',
      isFieldVerified: true,
      studentNotes: 'Titik ditambahkan secara mandiri pada sesi praktikum PAR.',
      sensorAnomaly: temp >= 42.0,
    };

    onAddCustomWaypoint(newWp);
    setIsAddingNew(false);
    setNewWpName('');
    setNewWpDesc('');
    onSelectWaypoint(newWp);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden text-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-800/90 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-orange-400" />
          <div>
            <h3 className="text-sm font-bold text-white">
              Stasiun Verifikasi Lapangan (Ground Check PAR)
            </h3>
            <p className="text-[11px] text-slate-400">
              Validasi koordinat GPS presisi dan edit titik lokasi sesuai data nyata di lapangan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentWp && !isEditingLocation && (
            <button
              onClick={() => handleStartEdit()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-300 bg-orange-950/70 hover:bg-orange-900/90 border border-orange-700/70 rounded-md transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Titik Lokasi ({currentWp.id})</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsAddingNew(!isAddingNew);
              setIsEditingLocation(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Titik Baru</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
        {/* Left Column: Waypoint List (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-2 max-h-[640px]">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Daftar Titik Lapangan Presisi ({waypoints.length})
            </span>
            <span className="text-[10px] text-slate-500">
              Klik pensil untuk edit
            </span>
          </div>

          {waypoints.map((wp) => {
            const isSelected = currentWp?.id === wp.id;
            return (
              <div
                key={wp.id}
                onClick={() => handleSelect(wp)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/95 border-orange-500 shadow-md ring-1 ring-orange-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-800/50">
                      {wp.id}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {wp.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    {wp.sensorAnomaly && (
                      <span className="text-[10px] font-mono font-semibold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded shrink-0">
                        HOT
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(wp);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-orange-400 hover:bg-orange-950/40 transition-colors"
                      title="Edit titik lokasi ini"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWaypoint(wp.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                      title="Hapus titik ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-red-400" />
                    {wp.tempCelsius}°C
                  </span>
                  <span>·</span>
                  <span>{wp.elevationM} m dpl</span>
                  <span>·</span>
                  <span className="text-emerald-400">NDVI {wp.ndvi}</span>
                </div>

                <div className="mt-1 text-[10px] font-mono text-slate-500 truncate">
                  WGS84: {wp.lat.toFixed(6)}°N, {wp.lng.toFixed(6)}°E
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Station Telemetry or Edit Location Form (7 cols) */}
        <div className="lg:col-span-7 p-5 overflow-y-auto space-y-4 max-h-[640px]">
          {/* Add Waypoint Form if toggled */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateWaypoint}
              className="p-4 bg-slate-950 border border-orange-500/50 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Plot Titik Lapangan Baru</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Gunakan koordinat kursor peta terakhir ({hoveredCell ? `${hoveredCell.lat.toFixed(6)}°N, ${hoveredCell.lng.toFixed(6)}°E` : '1.271100°N, 124.826400°E'}) atau simpan lalu sesuaikan via fitur Edit Titik.
              </p>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Nama Titik Lapangan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mata Air Hangat Kasuratan Sektor B"
                  value={newWpName}
                  onChange={(e) => setNewWpName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Keterangan Observasi
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan kondisi fisik tanah, bau belerang, vegetasi..."
                  value={newWpDesc}
                  onChange={(e) => setNewWpDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded"
                >
                  Simpan Titik
                </button>
              </div>
            </form>
          )}

          {/* EDIT TITIK LOKASI FORM (FEATURE REQUEST) */}
          {isEditingLocation && currentWp && (
            <form
              onSubmit={handleSaveLocationEdit}
              className="p-5 bg-slate-950 border-2 border-orange-500 rounded-lg shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-orange-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Edit Titik Lokasi &amp; Data Ground Check: {currentWp.id}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2.5 bg-orange-950/30 border border-orange-800/50 rounded-md text-[11px] text-orange-200 flex items-center justify-between">
                <span>Sesuaikan koordinat Latitude dan Longitude dengan data GPS asli di lapangan.</span>
                {hoveredCell && (
                  <button
                    type="button"
                    onClick={handleUseCursorCoordForEdit}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded shrink-0 transition-colors ml-2"
                    title="Gunakan posisi terakhir kursor peta"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Salin dari Peta ({hoveredCell.lat.toFixed(5)}°, {hoveredCell.lng.toFixed(5)}°)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Nama Titik / Stasiun Lapangan
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-orange-300 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-400" />
                    <span>Latitude (°N, Desimal Presisi WGS84)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1.271100"
                    value={editForm.lat}
                    onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-orange-500/80 rounded text-white focus:outline-none focus:border-orange-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Format: 1.xxxxxx (Kota Tomohon)</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-orange-300 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-400" />
                    <span>Longitude (°E, Desimal Presisi WGS84)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 124.826400"
                    value={editForm.lng}
                    onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-orange-500/80 rounded text-white focus:outline-none focus:border-orange-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Format: 124.xxxxxx (Sulawesi Utara)</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Kategori Zona Wilayah
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Waypoint['category'] })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="lake">Danau Hidrotermal (Danau Linow)</option>
                    <option value="mud_pool">Kawah Lumpur Mendidih (Kasuratan)</option>
                    <option value="fumarole">Fumarol / Solfatara Uap Panas</option>
                    <option value="hot_spring">Mata Air Panas Alami (Ranowangko)</option>
                    <option value="power_plant">Infrastruktur PLTP / Wellpad PGE</option>
                    <option value="forest_buffer">Hutan Lindung &amp; Wisata Pinus</option>
                    <option value="village_office">Kantor Kelurahan &amp; Permukiman</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Suhu Permukaan (°C Lapangan)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.tempCelsius}
                    onChange={(e) => setEditForm({ ...editForm, tempCelsius: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Elevasi (m dpl)
                  </label>
                  <input
                    type="number"
                    value={editForm.elevationM}
                    onChange={(e) => setEditForm({ ...editForm, elevationM: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Nilai NDVI Spektral
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="-1"
                    max="1"
                    value={editForm.ndvi}
                    onChange={(e) => setEditForm({ ...editForm, ndvi: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Protokol Keselamatan &amp; Bahaya K3
                  </label>
                  <input
                    type="text"
                    value={editForm.hazardNote}
                    onChange={(e) => setEditForm({ ...editForm, hazardNote: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Deskripsi Karakteristik Lapangan
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Perubahan titik akan otomatis menggeser pin pada Google Maps satelit.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingLocation(false)}
                    className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded transition-colors shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan Titik</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Regular Active Station Telemetry Display */}
          {currentWp && !isEditingLocation && (
            <>
              {/* Waypoint Header & Coordinates with Edit and Delete buttons */}
              <div className="flex flex-wrap items-start justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-orange-600 text-white">
                      {currentWp.id}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {currentWp.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-300 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span className="font-semibold text-orange-300">
                      {currentWp.lat.toFixed(6)}°N, {currentWp.lng.toFixed(6)}°E
                    </span>
                    <span className="text-slate-500">·</span>
                    <span>Elevasi: {currentWp.elevationM}m ASL</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-300 hover:text-white bg-orange-950/60 hover:bg-orange-900/80 border border-orange-700/60 rounded-md transition-colors"
                    title="Sesuaikan koordinat titik dengan data asli di lapangan"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Titik Lokasi</span>
                  </button>

                  <button
                    onClick={() => onDeleteWaypoint(currentWp.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-900/60 rounded-md transition-colors shrink-0"
                    title="Hapus titik yang tidak sengaja terbuat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Titik</span>
                  </button>
                </div>
              </div>

              {/* Virtual Sensor Telemetry Panel */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Pembacaan Instrumen Lapangan Digital
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-md">
                    <span className="text-[10px] text-slate-500 block">TERMOMETER IR</span>
                    <span className="text-lg font-mono font-bold text-red-400">
                      {currentWp.tempCelsius}°C
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {currentWp.tempCelsius > 70 ? 'Ekstrem Panas' : currentWp.tempCelsius > 40 ? 'Anomali Hangat' : 'Suhu Normal'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-md">
                    <span className="text-[10px] text-slate-500 block">SENSOR GAS H2S</span>
                    <span className="text-lg font-mono font-bold text-amber-400">
                      {currentWp.category === 'fumarole' ? '18.4 ppm' : currentWp.category === 'mud_pool' ? '12.1 ppm' : '< 0.5 ppm'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {currentWp.category === 'fumarole' || currentWp.category === 'mud_pool' ? 'Waspada Emisi' : 'Aman Respirasi'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-md">
                    <span className="text-[10px] text-slate-500 block">pH AIR/LUMPUR</span>
                    <span className="text-lg font-mono font-bold text-cyan-400">
                      {currentWp.category === 'lake' ? 'pH 4.8' : currentWp.category === 'mud_pool' ? 'pH 3.1' : 'pH 6.8'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {currentWp.category === 'mud_pool' ? 'Asam Sulfat' : 'Asam Ringan'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-md">
                    <span className="text-[10px] text-slate-500 block">AKURASI GPS</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      ± 0.05 m
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      RTK WGS84
                    </span>
                  </div>
                </div>
              </div>

              {/* Hazard & Scientific Context */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-red-950/30 border border-red-900/60 rounded-md text-red-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-red-300">
                      Protokol Keselamatan Lapangan (K3 Lapangan):
                    </span>
                    <p className="text-[11px] mt-0.5 leading-relaxed">
                      {currentWp.hazardNote}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-md text-slate-300">
                  <span className="font-semibold text-white block text-xs mb-1">
                    Konteks Geologis &amp; Iptek Geospasial:
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {currentWp.scientificContext}
                  </p>
                </div>
              </div>

              {/* Student Fieldwork Log & Notes */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Catatan Pengamatan Siswa (Fieldwork Logbook)
                  </label>
                  {isSavedToast && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Data berhasil disimpan!
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={editedNotes || currentWp.studentNotes || ''}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Tuliskan hasil pengamatan visual Anda di stasiun ini (warna air, jenis batuan, vegetasi, bau uap)..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500 leading-relaxed font-sans"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-md transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Catatan ke Laporan</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
