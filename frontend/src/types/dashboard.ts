import { AlertSignal } from './alert';
import { Region } from './region';
import { DataSource } from './dataSource';

export interface DashboardKPIs {
  totalRegions: number;
  activeAlerts: number;
  underInvestigation: number;
  normalRegions: number;
  totalReportedCases: number;
  avgSignalConfidence: number;
  dataFreshnessMinutes: number;
}

export interface DiseaseDistribution {
  name: string;
  cases: number;
  color: string;
  percentage: number;
}

export interface DailyTrendMetric {
  date: string;
  feverCases: number;
  coughSyrupSales: number;
  clinicVisits: number;
  baselineExpected: number;
  anomaliesDetected: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  regions: Region[];
  recentAlerts: AlertSignal[];
  dataSources: DataSource[];
  trends: DailyTrendMetric[];
  diseaseDistribution: DiseaseDistribution[];
  lastUpdated: string;
}
