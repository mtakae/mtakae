export type SpectralMode = 'true_color' | 'cir' | 'ndvi' | 'lst' | 'zoning';

export type BasemapProvider = 'google_satellite' | 'esri_satellite' | 'synthetic_raster';

export type EducationLevel = 'high_school' | 'undergraduate';

export type LandCoverType = 
  | 'geothermal_manifestation' 
  | 'pltp_infrastructure' 
  | 'lake_water' 
  | 'protection_forest' 
  | 'mixed_agriculture' 
  | 'residential_settlement';

export interface LandCoverClass {
  id: LandCoverType;
  name: string;
  indonesianName: string;
  color: string;
  description: string;
  areaHa: number;
  percentage: number;
  ndviRange: [number, number];
  lstRange: [number, number];
}

export interface Waypoint {
  id: string;
  name: string;
  category: 'fumarole' | 'hot_spring' | 'mud_pool' | 'power_plant' | 'lake' | 'forest_buffer' | 'village_office';
  lat: number;
  lng: number;
  gridX: number; // 0 to 100 percentage
  gridY: number; // 0 to 100 percentage
  tempCelsius: number;
  elevationM: number;
  ndvi: number;
  hazardNote: string;
  description: string;
  scientificContext: string;
  isFieldVerified: boolean;
  studentNotes?: string;
  sensorAnomaly: boolean;
}

export interface GridCell {
  x: number;
  y: number;
  lat: number;
  lng: number;
  elevation: number;
  lst: number;
  ndvi: number;
  landCover: LandCoverType;
  isAnomaly: boolean;
  isZoningConflict: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  academicReference: string;
}

export interface FieldReportData {
  studentName: string;
  studentId: string;
  institution: string;
  classGrade: string;
  reportDate: string;
  instructorName: string;
  executiveSummary: string;
  keyFindings: string[];
  loggedWaypoints: Waypoint[];
  preTestScore?: number;
  postTestScore?: number;
}
