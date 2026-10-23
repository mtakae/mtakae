import React from 'react';
import { PROPOSAL_METADATA } from '../data/lahendongData';
import { 
  BookMarked, 
  Users, 
  Target, 
  Calendar, 
  Coins, 
  ExternalLink, 
  ShieldCheck, 
  FileCheck2,
  X
} from 'lucide-react';

interface ProposalReferenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalReferenceDrawer: React.FC<ProposalReferenceDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <BookMarked className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Dossier Usulan PKM_K2 UNSRAT (Maret 2026)
              </h3>
              <p className="text-[11px] text-slate-400">
                Dokumen Resmi Program Kemitraan Masyarakat Klaster 2 FMIPA UNSRAT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Identity Block */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
              JUDUL KEGIATAN PENGABDIAN
            </span>
            <h4 className="text-sm font-bold text-white leading-snug">
              {PROPOSAL_METADATA.title}
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500 block">Skema:</span>
                <span className="text-slate-300 font-medium">{PROPOSAL_METADATA.scheme}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Masa Pelaksanaan:</span>
                <span className="text-slate-300 font-medium">{PROPOSAL_METADATA.duration}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lokasi Mitra:</span>
                <span className="text-slate-300 font-medium">Kantor Kelurahan Lahendong, Tomohon Selatan</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Anggaran:</span>
                <span className="text-slate-300 font-mono font-medium">Rp 10.130.000,-</span>
              </div>
            </div>
          </div>

          {/* Research & Community Service Team */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-300 text-xs">
              <Users className="w-4 h-4 text-orange-400" />
              <span>Susunan Tim Pengusul &amp; Peneliti FMIPA UNSRAT</span>
            </div>
            <div className="space-y-1.5 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px]">
              <div className="font-semibold text-white">
                Ketua Pengusul: <span className="text-orange-300">{PROPOSAL_METADATA.leadInvestigator}</span>
              </div>
              <div className="text-slate-300 pt-1">
                <span className="font-medium text-slate-400 block mb-0.5">Dosen Pengusul / Peneliti Terkait:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {PROPOSAL_METADATA.coInvestigators.map((dosen, i) => (
                    <li key={i}>{dosen}</li>
                  ))}
                </ul>
              </div>
              <div className="text-slate-400 pt-1">
                <span className="font-medium text-slate-400 block mb-0.5">Mahasiswa Pembantu Pelaksana:</span>
                <span className="text-slate-300">
                  {PROPOSAL_METADATA.studentResearchers.join(' · ')}
                </span>
              </div>
            </div>
          </div>

          {/* Core Objectives & Outputs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-300 text-xs">
              <Target className="w-4 h-4 text-orange-400" />
              <span>Target Luaran Wajib &amp; Tambahan (Bulan 1 s/d 8)</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded">
                <span className="font-bold text-white block">Luaran Wajib:</span>
                <span className="text-slate-400 block mt-0.5">
                  1. Artikel Ilmiah pada Jurnal Nasional ber-ISSN (Bulan ke-6 submit, Bulan ke-8 accepted/publish)
                </span>
                <span className="text-slate-400 block">
                  2. Video Dokumentasi Pelatihan &amp; Validasi Lapangan (durasi minimal 5 menit di YouTube)
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded">
                <span className="font-bold text-white block">Luaran Tambahan &amp; Keberlanjutan:</span>
                <span className="text-slate-400 block mt-0.5">
                  1. Peta Tematik Kawasan Geothermal Skala Detail 1:5.000 (Digital Shapefile/GeoJSON &amp; Cetak A0)
                </span>
                <span className="text-slate-400 block">
                  2. Dokumen Standar Operasional Prosedur (SOP) Pemantauan Wilayah
                </span>
                <span className="text-slate-400 block">
                  3. Peningkatan skor kompetensi aparatur minimal 30% (Pre-test vs Post-test)
                </span>
                <span className="text-slate-400 block">
                  4. Terbentuknya Kelompok Kerja (Pokja) Geospasial Kelurahan via SK Lurah
                </span>
              </div>
            </div>
          </div>

          {/* SDG Alignment */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-lg space-y-1">
            <span className="font-bold text-emerald-400 block">
              Dukungan Terhadap Sustainable Development Goals (SDGs)
            </span>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              Program ini mendukung <strong>SDG 7 (Energi Bersih dan Terjangkau)</strong> melalui optimasi pemanfaatan potensi PLTP Lahendong, serta <strong>SDG 11 (Kota dan Pemukiman Berkelanjutan)</strong> dengan membekali aparatur desa data spasial akurat demi mitigasi risiko bencana geologi dan kepastian tata ruang.
            </p>
          </div>

          {/* References List */}
          <div className="space-y-1.5 text-[10px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="font-bold text-slate-300 block uppercase">
              Rujukan Ilmiah Utama dalam Proposal:
            </span>
            <p>• Brehme (2015), <em>Fault zones and prospects of geothermal reservoirs in Lahendong</em>.</p>
            <p>• Sumintadireja et al. (2001), <em>Lahendong Geothermal Field Boundary based on Geo Data</em>.</p>
            <p>• Muhajir et al. (2023), <em>Detecting thermal anomalies in Lahendong using ASTER TIR &amp; Landsat-8</em>.</p>
            <p>• Tamboto et al. (2023), <em>Distribusi Suhu Permukaan Tanah dan Hubungannya Indeks Vegetasi di Hutan Pinus Lahendong</em>.</p>
            <p>• Nugraha et al. (2024), <em>Identifikasi Potensi Panas Bumi Pendekatan SIG Danau Linow</em>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
