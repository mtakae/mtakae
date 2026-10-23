import React from 'react';
import { 
  SpectralMode, 
  EducationLevel, 
  GridCell 
} from '../types/gis';
import { 
  Thermometer, 
  Trees, 
  Map, 
  Sliders, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Eye
} from 'lucide-react';

interface MapControlsProps {
  spectralMode: SpectralMode;
  setSpectralMode: (mode: SpectralMode) => void;
  thermalThreshold: number;
  setThermalThreshold: (val: number) => void;
  ndviThreshold: number;
  setNdviThreshold: (val: number) => void;
  opacity: number;
  setOpacity: (val: number) => void;
  showZoningBorders: boolean;
  setShowZoningBorders: (val: boolean) => void;
  showContourLines: boolean;
  setShowContourLines: (val: boolean) => void;
  educationLevel: EducationLevel;
  cells: GridCell[];
}

export const MapControls: React.FC<MapControlsProps> = ({
  spectralMode,
  setSpectralMode,
  thermalThreshold,
  setThermalThreshold,
  ndviThreshold,
  setNdviThreshold,
  opacity,
  setOpacity,
  showZoningBorders,
  setShowZoningBorders,
  showContourLines,
  setShowContourLines,
  educationLevel,
  cells,
}) => {
  // Live aggregated telemetry
  const anomalyCells = cells.filter((c) => c.lst >= 42.0);
  const anomalyHa = (anomalyCells.length / cells.length) * 684.5;
  const avgTemp = (cells.reduce((acc, c) => acc + c.lst, 0) / cells.length).toFixed(1);

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
      {/* 1. Mode Selector Buttons */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
          Pilihan Citra &amp; Spektral (Spectral Band Modes)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setSpectralMode('true_color')}
            className={`p-2.5 text-xs font-medium rounded-lg text-left transition-all border ${
              spectralMode === 'true_color'
                ? 'bg-slate-800 border-orange-500 text-white shadow-sm ring-1 ring-orange-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="font-semibold flex items-center justify-between">
              <span>Natural Color</span>
              <span className="text-[10px] font-mono text-slate-400">RGB 4-3-2</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Sentinel-2 citra optik warna nyata
            </p>
          </button>

          <button
            onClick={() => setSpectralMode('cir')}
            className={`p-2.5 text-xs font-medium rounded-lg text-left transition-all border ${
              spectralMode === 'cir'
                ? 'bg-slate-800 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="font-semibold flex items-center justify-between">
              <span>Color Infrared</span>
              <span className="text-[10px] font-mono text-rose-400">CIR 8-4-3</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Deteksi vegetasi &amp; batuan alterasi
            </p>
          </button>

          <button
            onClick={() => setSpectralMode('ndvi')}
            className={`p-2.5 text-xs font-medium rounded-lg text-left transition-all border ${
              spectralMode === 'ndvi'
                ? 'bg-slate-800 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="font-semibold flex items-center justify-between">
              <span>NDVI Index</span>
              <span className="text-[10px] font-mono text-emerald-400">[-1, +1]</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Kerapatan tutupan kanopi pinus
            </p>
          </button>

          <button
            onClick={() => setSpectralMode('lst')}
            className={`p-2.5 text-xs font-medium rounded-lg text-left transition-all border ${
              spectralMode === 'lst'
                ? 'bg-slate-800 border-red-500 text-white shadow-sm ring-1 ring-red-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="font-semibold flex items-center justify-between">
              <span>Thermal LST</span>
              <span className="text-[10px] font-mono text-red-400">B10 TIR</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Distribusi suhu panas bumi (°C)
            </p>
          </button>

          <button
            onClick={() => setSpectralMode('zoning')}
            className={`p-2.5 text-xs font-medium rounded-lg text-left transition-all border col-span-2 sm:col-span-1 ${
              spectralMode === 'zoning'
                ? 'bg-slate-800 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="font-semibold flex items-center justify-between">
              <span>Tata Ruang &amp; Konflik</span>
              <span className="text-[10px] font-mono text-purple-400">GIS BIG</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Batas WKP, hutan, dan permukiman
            </p>
          </button>
        </div>
      </div>

      {/* 2. Interactive Analytical Filter Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Thermometer className="w-3.5 h-3.5 text-red-400" />
              Ambang Anomali Termal (LST Cutoff)
            </span>
            <span className="font-mono font-semibold text-orange-400 text-xs">
              {thermalThreshold > 20 ? `≥ ${thermalThreshold} °C` : 'Semua Suhu'}
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={75}
            step={2}
            value={thermalThreshold}
            onChange={(e) => setThermalThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>20°C (Off)</span>
            <span>40°C (Hotspot)</span>
            <span>75°C (Fumarol)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Trees className="w-3.5 h-3.5 text-emerald-400" />
              Filter Masker Vegetasi (NDVI Cutoff)
            </span>
            <span className="font-mono font-semibold text-emerald-400 text-xs">
              {ndviThreshold > -0.5 ? `≥ ${ndviThreshold.toFixed(2)}` : 'Semua Tutupan'}
            </span>
          </div>
          <input
            type="range"
            min={-0.5}
            max={0.8}
            step={0.05}
            value={ndviThreshold}
            onChange={(e) => setNdviThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>-0.5 (Air/Tanah)</span>
            <span>0.3 (Kebun)</span>
            <span>0.7 (Hutan Pinus)</span>
          </div>
        </div>
      </div>

      {/* 3. Toggles & Opacity */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showContourLines}
              onChange={(e) => setShowContourLines(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-0"
            />
            <span>Garis Kontur Elevasi (DEM)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showZoningBorders}
              onChange={(e) => setShowZoningBorders(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-0"
            />
            <span>Grid Batas Wilayah</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Transparansi Lapisan:</span>
          <input
            type="range"
            min={0.3}
            max={1.0}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <span className="font-mono text-[11px] text-slate-400 w-8 text-right">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      </div>

      {/* 4. Live Telemetry Strip */}
      <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/70 border border-slate-800 rounded-md font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block">TOTAL LUAS WILAYAH</span>
          <span className="text-white font-bold">684.5 Ha</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">AREA ANOMALI TERMAL (≥42°C)</span>
          <span className="text-orange-400 font-bold">{anomalyHa.toFixed(1)} Ha</span>
          <span className="text-[10px] text-slate-500 ml-1">
            ({((anomalyHa / 684.5) * 100).toFixed(1)}%)
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">RATA-RATA SUHU PERMUKAAN</span>
          <span className="text-emerald-400 font-bold">{avgTemp} °C</span>
        </div>
      </div>

      {/* 5. Pedagogical Theory Card based on Level */}
      <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-lg text-xs leading-relaxed">
        <div className="flex items-center gap-2 font-semibold text-orange-400 mb-1.5">
          <BookOpen className="w-4 h-4" />
          <span>
            {educationLevel === 'high_school'
              ? 'Wawasan Pembelajaran: Tingkat Menengah (SMA/SMK)'
              : 'Dasar Teori & Matematika Sensor: Tingkat Mahasiswa (S1)'}
          </span>
        </div>

        {educationLevel === 'high_school' ? (
          <p className="text-slate-300 text-[11px]">
            Satelit seperti <strong>Sentinel-2</strong> dan <strong>Landsat-8</strong> merekam cahaya yang tidak bisa dilihat mata manusia. Inframerah termal mendeteksi panas uap bumi bawah tanah di Lahendong tanpa harus menggali tanah. Vegetasi pinus yang lebat menyerap panas matahari dan menjaga kestabilan air tanah Danau Linow, sedangkan kawah lumpur bersuhu di atas 80°C tampak membara pada peta sensor panas.
          </p>
        ) : (
          <div className="space-y-1 text-slate-300 text-[11px]">
            <p>
              Inversi LST dihitung dari radiansi spektral Band 10 Landsat-8/9 ($L_\lambda$) melalui persamaan Planck terkalibrasi:
              <code className="mx-1 px-1 py-0.5 bg-slate-800 rounded font-mono text-orange-300">
                BT = K₂ / ln(K₁ / L_λ + 1)
              </code>
              di mana K₁ = 774.88 dan K₂ = 1321.07. Koreksi emisivitas permukaan (ε) diturunkan dari Fractional Vegetation Cover (FVC) berbasis NDVI (FVC = ((NDVI - NDVI_min) / (NDVI_max - NDVI_min))²).
            </p>
            <p className="text-slate-400 text-[10px] pt-1">
              Rujukan: Brehme (2015), Muhajir et al. (2023), Standar BIG No. 6 Tahun 2018 untuk Peta Tematik Skala 1:5.000.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
