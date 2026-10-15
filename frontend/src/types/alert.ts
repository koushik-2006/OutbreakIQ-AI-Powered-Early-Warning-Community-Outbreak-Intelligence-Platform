import { RiskLevel } from './region';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'new' | 'investigating' | 'monitoring' | 'resolved' | 'dismissed';

export interface AlertEvidencePoint {
  date: string;
  observed: number;
  expectedBaseline: number;
  upperThreshold: number;
}

export interface AlertSupportingSignal {
  source: 'pharmacy' | 'clinic' | 'public_health' | 'school_absenteeism';
  indicator: string;
  changeRate: string;
  reliabilityScore: number; // 0 to 1
  description: string;
}

export interface AlertSignal {
  id: string;
  title: string;
  regionId: string;
  regionName: string;
  indicator: string;
  severity: AlertSeverity;
  status: AlertStatus;
  percentChange: number;
  zScore: number;
  confidenceScore: number; // e.g. 0.94
  timestamp: string;
  investigationId?: string;
  description: string;
  isPreliminary: boolean; // Always true for early detection
  evidenceTimeSeries?: AlertEvidencePoint[];
  supportingSignals?: AlertSupportingSignal[];
  dataQualityWarning?: string;
}
