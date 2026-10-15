export type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'normal';

export interface RegionIndicator {
  name: string;
  currentValue: number;
  baselineValue: number;
  unit: string;
  percentChange: number;
  status: 'elevated' | 'normal' | 'concerning';
}

export interface Region {
  id: string;
  name: string;
  code: string;
  riskLevel: RiskLevel;
  population: number;
  reportedCases: number;
  activeAlerts: number;
  activeInvestigations: number;
  dataCompleteness: number; // percentage (e.g. 96)
  lastUpdated: string;
  coordinates: { x: number; y: number }; // Relative coordinates for schematic map
  keyIndicator: string;
  changeRate: number; // e.g. +180%
  description?: string;
  indicators?: RegionIndicator[];
  warningNote?: string;
}

export interface RegionTrendPoint {
  date: string;
  feverCases: number;
  coughSyrupSales: number;
  iliVisits: number;
  baseline: number;
}
