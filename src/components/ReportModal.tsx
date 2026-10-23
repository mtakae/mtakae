import React, { useState } from 'react';
import { Waypoint, LandCoverClass, GridCell } from '../types/gis';
import { 
  LAND_COVER_CLASSES, 
  PROPOSAL_METADATA, 
  LAHENDONG_BOUNDS 
} from '../data/lahendongData';
import { 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  Building, 
  Calendar, 
  User, 
  Award,
  Layers,
  Thermometer,
  ShieldCheck
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  waypoints: Waypoint[];
  cells: GridCell[];
  preTestScore?: number;
  postTestScore?: number;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  waypoints,
  cells,
  preTestScore,
  postTestScore,
}) => {
  const [studentName, setStudentName] = useState<string>('Mahasiswa Praktikan SIG');
  const [studentId, setStudentId] = useState<string>('22021106001');
  const [institution, setInstitution] = useState<string>('Universitas Sam Ratulangi (UNSRAT)');
  const [classGrade, setClassGrade] = useState<string>('Geosains & Sistem Informasi');
  const [instructorName, setInstructorName] = useState<string>(
    'Dr. Winsy Ch. D. Weku / Mahardika Inra Takaendengan, SST., M.Si'
  );
  const [reportDate, setReportDate] = useState<string>(
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  if (!isOpen) return null;

  // Real-time calculations from cells
  const totalCells = cells.length;
  const anomalyCells = cells.filter((c) => c.lst >= 42.0);
  const anomalyHa = ((anomalyCells.length / totalCells) * LAHENDONG_BOUNDS.totalAreaHa).toFixed(1);
  const maxTemp = Math.max(...cells.map((c) => c.lst));
  const avgTemp = (cells.reduce((a, b) => a + b.lst, 0) / totalCells).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Top Floating Action Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-sm">
              Generator Laporan Praktikum Spasial &amp; Lapangan Geotermal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Editable Student Inputs Bar (Hidden during print) */}
        <div className="no-print p-4 bg-slate-100 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
              Nama Siswa/Mahasiswa:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-medium focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
              NIM / NISN:
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-medium focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
              Institusi / Sekolah:
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-medium focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
              Dosen / Pengampu:
            </label>
            <input
              type="text"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-medium focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Printable Report Document Sheet */}
        <div className="report-sheet p-8 overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* Formal University Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">
                UNIVERSITAS SAM RATULANGI · FAKULTAS MATEMATIKA DAN ILMU PENGETAHUAN ALAM
              </span>
              <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                LAPORAN PRAKTIKUM PEMETAAN GEOSPASIAL KAWASAN GEOTHERMAL
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Kelurahan Lahendong, Kecamatan Tomohon Selatan, Kota Tomohon, Sulawesi Utara
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Program Kemitraan Masyarakat Klaster 2 (PKM_K2) · Modul Edukasi Sains Komputasi &amp; Penginderaan Jauh
              </p>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-600 hidden sm:block shrink-0 pl-4">
              <div>No. Dokumen: <span className="font-bold text-slate-900">PKM-LHD-2026/01</span></div>
              <div>Tanggal: {reportDate}</div>
              <div>Skala Peta: 1:5.000 (BIG)</div>
            </div>
          </div>

          {/* Student & Fieldwork Metadata Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">NAMA PRAKTIKAN</span>
              <span className="font-bold text-slate-900 text-xs">{studentName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">NIM / ID SISWA</span>
              <span className="font-mono text-slate-800 text-xs">{studentId}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">PROGRAM / INSTITUSI</span>
              <span className="text-slate-800 text-xs truncate block">{institution}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">DOSEN / INSTRUKTUR</span>
              <span className="text-slate-800 text-xs truncate block">{instructorName}</span>
            </div>
          </div>

          {/* Section 1: Executive Spatial Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center gap-2">
              <span>1. RINGKASAN EKSEKUTIF ANALISIS SPASIAL LAHENDONG</span>
            </h2>
            <p className="text-justify text-slate-700 leading-relaxed text-[11px]">
              Praktikum ini mengevaluasi kawasan energi panas bumi Kelurahan Lahendong seluas <strong>{LAHENDONG_BOUNDS.totalAreaHa} Hektar</strong>. Melalui perpaduan citra multispektral Sentinel-2 (Band 4, 3, 2, dan 8) serta sensor termal Landsat-8/9 TIRS (Band 10), praktikan memetakan anomali termal Land Surface Temperature (LST), tutupan kanopi vegetasi (NDVI), serta zonasi tata kelola energi terbarukan Pembangkit Listrik Tenaga Panas Bumi (PLTP) Lahendong Unit 1–6 yang berbatasan langsung dengan Hutan Lindung Pinus dan permukiman warga.
            </p>
          </div>

          {/* Section 2: Spatial Area Breakdown Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>2. TABEL STATISTIK TUTUPAN LAHAN (LAND COVER &amp; ZONASI)</span>
              <span className="text-[10px] font-normal text-slate-500">Standar Klasifikasi BIG 1:5.000</span>
            </h2>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                    <th className="py-2 px-3">Kode / Kelas Tutupan Lahan</th>
                    <th className="py-2 px-3 text-right">Luas (Ha)</th>
                    <th className="py-2 px-3 text-right">Proporsi (%)</th>
                    <th className="py-2 px-3 text-center">Rentang LST (°C)</th>
                    <th className="py-2 px-3 text-center">Rentang NDVI</th>
                    <th className="py-2 px-3">Fungsi Lingkungan &amp; Tata Ruang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {LAND_COVER_CLASSES.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0 border border-black/20"
                          style={{ backgroundColor: cls.color }}
                        />
                        <span>{cls.indonesianName}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {cls.areaHa.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {cls.percentage.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-700">
                        {cls.lstRange[0]} - {cls.lstRange[1]}°C
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-700">
                        {cls.ndviRange[0]} s/d {cls.ndviRange[1]}
                      </td>
                      <td className="py-2 px-3 text-slate-600 text-[10px]">
                        {cls.description}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="py-2 px-3">Total Wilayah Kelurahan Lahendong</td>
                    <td className="py-2 px-3 text-right font-mono">684.5 Ha</td>
                    <td className="py-2 px-3 text-right font-mono">100.0%</td>
                    <td className="py-2 px-3 text-center font-mono">Rerata: {avgTemp}°C</td>
                    <td className="py-2 px-3 text-center font-mono">Multispektral</td>
                    <td className="py-2 px-3">Batas Administrasi Definitif</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Thermal Anomaly & Geothermal Manifestations */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              3. ANALISIS ANOMALI TERMAL DAN SUMBER DAYA ENERGI TERBARUKAN
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-[10px] font-bold text-red-700 uppercase block">
                  Luas Anomali Termal (LST ≥ 42°C)
                </span>
                <span className="text-lg font-mono font-bold text-red-900">
                  {anomalyHa} Hektar
                </span>
                <p className="text-[10px] text-red-700 mt-1">
                  Konsentrasi tertinggi di Kawah Lumpur Kasuratan dan Fumarol Sektor Barat.
                </p>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                <span className="text-[10px] font-bold text-orange-700 uppercase block">
                  Suhu Puncak Lapangan
                </span>
                <span className="text-lg font-mono font-bold text-orange-900">
                  {maxTemp} °C
                </span>
                <p className="text-[10px] text-orange-700 mt-1">
                  Uap superheated fluida hidrotermal reservoir atas (Brehme, 2015).
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                  Tutupan Sabuk Hutan Pinus
                </span>
                <span className="text-lg font-mono font-bold text-emerald-900">
                  312.6 Hektar (45.7%)
                </span>
                <p className="text-[10px] text-emerald-700 mt-1">
                  Buffer ekologis dan resapan air untuk keberlanjutan siklus geothermal PLTP.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Logbook Verifikasi Lapangan (Ground Truth PAR) */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              4. BUKU CATATAN HASIL SURVEI GROUND CHECK (PARTICIPATORY ACTION RESEARCH)
            </h2>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                    <th className="py-1.5 px-3">ID Titik</th>
                    <th className="py-1.5 px-3">Nama Objek Survei</th>
                    <th className="py-1.5 px-3">Koordinat WGS84</th>
                    <th className="py-1.5 px-3 text-center">Suhu IR (°C)</th>
                    <th className="py-1.5 px-3 text-center">NDVI</th>
                    <th className="py-1.5 px-3">Catatan Observasi Lapangan Praktikan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {waypoints.map((wp) => (
                    <tr key={wp.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-900">
                        {wp.id}
                      </td>
                      <td className="py-1.5 px-3 font-semibold text-slate-800">
                        {wp.name}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-[10px] text-slate-600">
                        {wp.lat.toFixed(6)}°N, {wp.lng.toFixed(6)}°E ({wp.elevationM}m)
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono font-bold text-red-700">
                        {wp.tempCelsius}°C
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono text-emerald-700">
                        {wp.ndvi}
                      </td>
                      <td className="py-1.5 px-3 text-slate-700 text-[10px] leading-tight">
                        {wp.studentNotes || wp.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Pre-Test & Post-Test Competence Evaluation */}
          {(preTestScore !== undefined || postTestScore !== undefined) && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between">
                <span>5. HASIL EVALUASI KOMPETENSI PRAKTIKUM (PRE-TEST &amp; POST-TEST)</span>
                {preTestScore !== undefined && postTestScore !== undefined && (
                  <span className="font-mono text-emerald-700 font-bold">
                    Peningkatan: +{postTestScore - preTestScore}%
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">NILAI PRE-TEST AWAL</span>
                  <span className="text-base font-bold font-mono text-slate-800">
                    {preTestScore !== undefined ? `${preTestScore} / 100` : 'Belum Dikerjakan'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">NILAI POST-TEST AKHIR</span>
                  <span className="text-base font-bold font-mono text-emerald-700">
                    {postTestScore !== undefined ? `${postTestScore} / 100` : 'Belum Dikerjakan'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">STATUS CAPAIAN PKM</span>
                  <span className="text-xs font-bold text-slate-900 block mt-1">
                    {preTestScore !== undefined && postTestScore !== undefined && postTestScore - preTestScore >= 30
                      ? '✓ Memenuhi Target Usulan (Gain ≥30%)'
                      : 'Kompetensi Berhasil Tercatat'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Formal Signatures Block */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="text-slate-500 text-[11px]">Mahasiswa / Praktikan,</p>
              <div className="h-14 flex items-end justify-center font-mono text-slate-400">
                (Tanda Tangan Digital)
              </div>
              <p className="font-bold text-slate-900 underline mt-1">{studentName}</p>
              <p className="text-[10px] font-mono text-slate-500">NIM. {studentId}</p>
            </div>

            <div>
              <p className="text-slate-500 text-[11px]">Dosen Pembimbing / Tim PKM UNSRAT,</p>
              <div className="h-14 flex items-end justify-center font-mono text-slate-400">
                (Validasi Akademik)
              </div>
              <p className="font-bold text-slate-900 underline mt-1">Dr. Winsy Ch. D. Weku / Mahardika Inra Takaendengan, M.Si</p>
              <p className="text-[10px] font-mono text-slate-500">Tim PKM_K2 FMIPA UNSRAT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
