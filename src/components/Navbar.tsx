import React from 'react';
import { Layers, FileText, Compass, GraduationCap, Info } from 'lucide-react';

interface NavbarProps {
  activeTab: 'explorer' | 'groundcheck' | 'quiz' | 'report';
  setActiveTab: (tab: 'explorer' | 'groundcheck' | 'quiz' | 'report') => void;
  onOpenReport: () => void;
  onOpenProposalModal: () => void;
  educationLevel: 'high_school' | 'undergraduate';
  setEducationLevel: (level: 'high_school' | 'undergraduate') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  onOpenProposalModal,
  educationLevel,
  setEducationLevel,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-sm">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); setActiveTab('explorer'); }}
          className="text-lg font-bold tracking-tight text-white hover:text-orange-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
          GeoThermalEdu Lahendong
        </a>
        <span className="hidden lg:inline text-xs text-slate-400">
          UNSRAT PKM_K2 Lab
        </span>
      </div>

      {/* Zone 2: 4 single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'explorer' ? 'text-orange-400 font-semibold underline underline-offset-8 decoration-2 decoration-orange-400' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          GIS Map Explorer
        </button>

        <button
          onClick={() => setActiveTab('groundcheck')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'groundcheck' ? 'text-orange-400 font-semibold underline underline-offset-8 decoration-2 decoration-orange-400' : 'text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          Virtual Ground-Check
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'quiz' ? 'text-orange-400 font-semibold underline underline-offset-8 decoration-2 decoration-orange-400' : 'text-slate-400'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Pre/Post Test
        </button>

        <button
          onClick={() => onOpenProposalModal()}
          className="flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 text-slate-400 hover:text-white"
        >
          <Info className="w-4 h-4" />
          Proposal Dossier
        </button>
      </nav>

      {/* Zone 3: 1 primary action button + level toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center bg-slate-800 rounded-md p-0.5 text-xs text-slate-300 border border-slate-700">
          <button
            onClick={() => setEducationLevel('high_school')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              educationLevel === 'high_school' ? 'bg-orange-600 text-white font-medium' : 'hover:text-white'
            }`}
          >
            High School
          </button>
          <button
            onClick={() => setEducationLevel('undergraduate')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              educationLevel === 'undergraduate' ? 'bg-orange-600 text-white font-medium' : 'hover:text-white'
            }`}
          >
            Undergraduate
          </button>
        </div>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export Fieldwork Report</span>
        </button>
      </div>
    </header>
  );
};
